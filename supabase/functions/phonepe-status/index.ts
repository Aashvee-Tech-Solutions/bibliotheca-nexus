import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.188.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const { transaction_id } = await req.json();

    if (!transaction_id) {
      throw new Error('Transaction ID is required');
    }

    console.log('Checking payment status for transaction:', transaction_id);

    const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID') ?? '';
    const saltKey = Deno.env.get('PHONEPE_SALT_KEY') ?? '';
    const keyIndex = 1;

    // Create checksum for status check
    const checksumString = `/pg/v1/status/${merchantId}/${transaction_id}` + saltKey;
    const encoder = new TextEncoder();
    const data = encoder.encode(checksumString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + "###" + keyIndex;

    // Make status check request to PhonePe
    const statusResponse = await fetch(`https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${transaction_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': merchantId,
        'accept': 'application/json'
      }
    });

    const statusResult = await statusResponse.json();
    
    console.log('PhonePe status response:', statusResult);

    let paymentStatus = 'failed';
    if (statusResult.success && statusResult.data) {
      const { state, responseCode } = statusResult.data;
      
      if (state === 'COMPLETED' && responseCode === 'SUCCESS') {
        paymentStatus = 'completed';
      } else if (state === 'PENDING') {
        paymentStatus = 'pending';
      }
    }

    // Update the purchase record with the latest status
    const { data: purchase, error: fetchError } = await supabase
      .from('authorship_purchases')
      .select('*')
      .eq('payment_id', transaction_id)
      .single();

    if (fetchError) {
      console.error('Error finding purchase:', fetchError);
      throw new Error('Purchase not found');
    }

    // Only update if status has changed
    if (purchase.payment_status !== paymentStatus) {
      const { error: updateError } = await supabase
        .from('authorship_purchases')
        .update({
          payment_status: paymentStatus,
          payment_details: JSON.stringify({
            ...JSON.parse(purchase.payment_details || '{}'),
            status_check_response: statusResult,
            last_status_check: new Date().toISOString()
          })
        })
        .eq('payment_id', transaction_id);

      if (updateError) {
        console.error('Error updating purchase status:', updateError);
        throw updateError;
      }

      console.log('Payment status updated to:', paymentStatus);
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentStatus,
        transactionId: transaction_id,
        phonepeResponse: statusResult,
        message: 'Payment status retrieved successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Status check error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Status check failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
