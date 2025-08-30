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

    const { purchase_id, amount, user_details } = await req.json();
    const { phone_number, name } = user_details;

    console.log('Processing PhonePe payment for purchase:', purchase_id, 'Amount:', amount);

    const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID') ?? '';
    const saltKey = Deno.env.get('PHONEPE_SALT_KEY') ?? '';
    const keyIndex = 1;

    // Generate unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // PhonePe payment request payload
    const paymentPayload = {
      merchantId: merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: `USER_${purchase_id}`,
      amount: amount * 100, // Convert to paise
      redirectUrl: `${req.headers.get('origin')}/payment-success?txnId=${transactionId}`,
      redirectMode: "POST",
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/phonepe-webhook`,
      mobileNumber: phone_number,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    // Base64 encode the payload
    const base64Payload = btoa(JSON.stringify(paymentPayload));
    
    // Create checksum
    const checksumString = base64Payload + "/pg/v1/pay" + saltKey;
    const encoder = new TextEncoder();
    const data = encoder.encode(checksumString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + "###" + keyIndex;

    console.log('Creating PhonePe payment request...');
    
    // Make request to PhonePe
    const phonepeResponse = await fetch('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', {
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
    
    console.log('PhonePe response:', phonepeResult);

    let paymentStatus = 'pending';
    let paymentUrl = null;

    if (phonepeResult.success && phonepeResult.data?.instrumentResponse?.redirectInfo?.url) {
      paymentUrl = phonepeResult.data.instrumentResponse.redirectInfo.url;
      console.log('Payment URL generated successfully');
    } else {
      throw new Error(`PhonePe payment initiation failed: ${phonepeResult.message || 'Unknown error'}`);
    }

    // Update the purchase record with payment details
    const { data: purchaseData, error: fetchError } = await supabase
      .from('authorship_purchases')
      .select('upcoming_book_id, position_purchased')
      .eq('id', purchase_id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { error: updateError } = await supabase
      .from('authorship_purchases')
      .update({
        payment_id: transactionId,
        payment_status: paymentStatus,
        payment_details: JSON.stringify({
          phonepe_response: phonepeResult,
          merchant_transaction_id: transactionId,
          amount: amount
        })
      })
      .eq('id', purchase_id);

    if (updateError) {
      throw updateError;
    }

    console.log('Payment initiated successfully:', transactionId);

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: transactionId,
        paymentUrl: paymentUrl,
        status: paymentStatus,
        message: 'Payment initiated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Payment initiation failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});