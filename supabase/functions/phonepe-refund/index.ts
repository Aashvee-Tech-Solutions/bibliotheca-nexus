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

    // Verify authentication (admin only)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const { data: { user: authUser } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!authUser) {
      throw new Error('Invalid authentication');
    }

    // Verify admin role
    const { data: adminCheck, error: adminError } = await supabase
      .rpc('has_role', { role_name: 'admin' });

    if (adminError || !adminCheck) {
      throw new Error('Admin access required');
    }

    const { purchase_id, refund_amount, reason } = await req.json();

    if (!purchase_id || !refund_amount || !reason) {
      throw new Error('Missing required parameters');
    }

    console.log('Processing PhonePe refund for purchase:', purchase_id);

    // Get purchase details
    const { data: purchase, error: fetchError } = await supabase
      .from('authorship_purchases')
      .select('*')
      .eq('id', purchase_id)
      .single();

    if (fetchError || !purchase) {
      throw new Error('Purchase not found');
    }

    if (purchase.payment_status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    if (refund_amount > purchase.total_amount) {
      throw new Error('Refund amount cannot exceed original payment');
    }

    const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID') ?? '';
    const saltKey = Deno.env.get('PHONEPE_SALT_KEY') ?? '';
    const keyIndex = 1;

    // Generate unique refund transaction ID
    const refundTransactionId = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get original PhonePe transaction ID from payment details
    const paymentDetails = JSON.parse(purchase.payment_details || '{}');
    const originalTransactionId = paymentDetails.phonepe_transaction_id || purchase.payment_id;

    // PhonePe refund request payload
    const refundPayload = {
      merchantId: merchantId,
      merchantTransactionId: refundTransactionId,
      originalTransactionId: originalTransactionId,
      amount: refund_amount * 100, // Convert to paise
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/phonepe-refund-webhook`
    };

    // Base64 encode the payload
    const base64Payload = btoa(JSON.stringify(refundPayload));
    
    // Create checksum
    const checksumString = base64Payload + "/pg/v1/refund" + saltKey;
    const encoder = new TextEncoder();
    const data = encoder.encode(checksumString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + "###" + keyIndex;

    console.log('Creating PhonePe refund request...');
    
    // Make refund request to PhonePe
    const phonepeResponse = await fetch('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'accept': 'application/json'
      },
      body: JSON.stringify({
        request: base64Payload
      })
    });

    const phonepeResult = await phonepeResponse.json();
    
    console.log('PhonePe refund response:', phonepeResult);

    let refundStatus = 'failed';
    if (phonepeResult.success) {
      refundStatus = 'pending'; // PhonePe refunds are typically processed asynchronously
    }

    // Update purchase record with refund information
    const updatedPaymentDetails = {
      ...paymentDetails,
      refund_details: {
        refund_transaction_id: refundTransactionId,
        refund_amount: refund_amount,
        refund_reason: reason,
        refund_status: refundStatus,
        phonepe_refund_response: phonepeResult,
        refund_initiated_at: new Date().toISOString(),
        refund_initiated_by: authUser.id
      }
    };

    const { error: updateError } = await supabase
      .from('authorship_purchases')
      .update({
        payment_status: 'refunded',
        payment_details: JSON.stringify(updatedPaymentDetails)
      })
      .eq('id', purchase_id);

    if (updateError) {
      throw updateError;
    }

    // Log refund initiation
    await supabase.rpc('log_payment_event', {
      p_purchase_id: purchase_id,
      p_transaction_id: refundTransactionId,
      p_event_type: 'refund_initiated',
      p_event_data: {
        original_transaction_id: originalTransactionId,
        refund_amount: refund_amount,
        refund_reason: reason,
        refund_status: refundStatus,
        initiated_by: authUser.id
      }
    });

    // Restore book position availability
    await supabase
      .from('upcoming_books')
      .update({
        available_positions: supabase.raw('available_positions + ?', [purchase.positions_purchased])
      })
      .eq('id', purchase.upcoming_book_id);

    console.log('Refund initiated successfully:', refundTransactionId);

    return new Response(
      JSON.stringify({
        success: true,
        refundId: refundTransactionId,
        status: refundStatus,
        message: 'Refund initiated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Refund processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Refund processing failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
