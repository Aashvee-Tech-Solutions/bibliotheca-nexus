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

    const body = await req.json();
    console.log('PhonePe webhook received:', body);

    // Verify the webhook signature
    const xVerify = req.headers.get('X-VERIFY');
    const saltKey = Deno.env.get('PHONEPE_SALT_KEY') ?? '';
    const keyIndex = 1;

    if (!xVerify) {
      throw new Error('Missing X-VERIFY header');
    }

    // Decode the response
    const base64Response = body.response;
    const decodedResponse = JSON.parse(atob(base64Response));
    
    // Verify checksum
    const checksumString = base64Response + saltKey;
    const encoder = new TextEncoder();
    const data = encoder.encode(checksumString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedChecksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + "###" + keyIndex;

    if (xVerify !== expectedChecksum) {
      throw new Error('Invalid webhook signature');
    }

    const { merchantTransactionId, transactionId, amount, state, responseCode } = decodedResponse.data;
    
    console.log('Payment webhook data:', {
      merchantTransactionId,
      transactionId,
      amount,
      state,
      responseCode
    });

    // Update payment status in database
    let paymentStatus = 'failed';
    if (state === 'COMPLETED' && responseCode === 'SUCCESS') {
      paymentStatus = 'completed';
    } else if (state === 'PENDING') {
      paymentStatus = 'pending';
    }

    // Find the purchase by payment_id (merchantTransactionId)
    const { data: purchase, error: fetchError } = await supabase
      .from('authorship_purchases')
      .select('*')
      .eq('payment_id', merchantTransactionId)
      .single();

    if (fetchError) {
      console.error('Error finding purchase:', fetchError);
      throw new Error('Purchase not found');
    }

    // Update the purchase record
    const { error: updateError } = await supabase
      .from('authorship_purchases')
      .update({
        payment_status: paymentStatus,
        payment_details: JSON.stringify({
          ...JSON.parse(purchase.payment_details || '{}'),
          webhook_response: decodedResponse,
          phonepe_transaction_id: transactionId,
          webhook_received_at: new Date().toISOString()
        })
      })
      .eq('payment_id', merchantTransactionId);

    if (updateError) {
      console.error('Error updating purchase:', updateError);
      throw updateError;
    }

    // Log webhook event
    await supabase.rpc('log_payment_event', {
      p_purchase_id: purchase.id,
      p_transaction_id: merchantTransactionId,
      p_event_type: 'webhook_received',
      p_event_data: {
        payment_status: paymentStatus,
        phonepe_state: state,
        response_code: responseCode,
        transaction_id: transactionId,
        amount: amount
      }
    });

    // Process successful payment
    if (paymentStatus === 'completed') {
      console.log('Payment completed successfully for purchase:', purchase.id);
      
      // Log successful payment
      await supabase.rpc('log_payment_event', {
        p_purchase_id: purchase.id,
        p_transaction_id: merchantTransactionId,
        p_event_type: 'completed',
        p_event_data: {
          phonepe_transaction_id: transactionId,
          amount: amount,
          completed_at: new Date().toISOString()
        }
      });
      
      // TODO: Send confirmation email to user
      // The position availability will be updated by the database trigger
    }

    console.log('Webhook processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Webhook processing failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
