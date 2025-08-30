import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.188.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Utility function to validate phone number
function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// Utility function to sanitize inputs
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>"'&]/g, '');
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

    const { purchase_id, amount, user_details } = await req.json();
    const { phone_number, name } = user_details;

    // Validate inputs
    if (!purchase_id || !amount || !phone_number || !name) {
      throw new Error('Missing required parameters');
    }

    if (!validatePhoneNumber(phone_number)) {
      throw new Error('Invalid phone number format');
    }

    if (amount <= 0 || amount > 500000) { // Max 5 lakh INR
      throw new Error('Invalid amount');
    }

    const sanitizedName = sanitizeInput(name);
    if (sanitizedName.length < 2) {
      throw new Error('Invalid name');
    }

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

    // Verify purchase exists and user has permission
    const { data: purchaseData, error: fetchError } = await supabase
      .from('authorship_purchases')
      .select('*')
      .eq('id', purchase_id)
      .single();

    if (fetchError) {
      throw new Error('Purchase not found or access denied');
    }

    // Verify user owns this purchase (additional security check)
    const { data: { user: authUser } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!authUser || purchaseData.user_id !== authUser.id) {
      throw new Error('Unauthorized access to purchase');
    }

    // Check if payment is already processed
    if (purchaseData.payment_status === 'completed') {
      throw new Error('Payment already completed for this purchase');
    }

    // Update the purchase record with payment details
    const { error: updateError } = await supabase
      .from('authorship_purchases')
      .update({
        payment_id: transactionId,
        payment_status: paymentStatus,
        payment_method: 'phonepe',
        payment_details: JSON.stringify({
          phonepe_response: phonepeResult,
          merchant_transaction_id: transactionId,
          amount: amount,
          phone_number: phone_number,
          customer_name: sanitizedName,
          initiated_at: new Date().toISOString()
        })
      })
      .eq('id', purchase_id);

    if (updateError) {
      throw updateError;
    }

    // Log payment initiation
    await supabase.rpc('log_payment_event', {
      p_purchase_id: purchase_id,
      p_transaction_id: transactionId,
      p_event_type: 'initiated',
      p_event_data: {
        amount: amount,
        phone_number: phone_number,
        payment_method: 'phonepe',
        payment_url_generated: !!paymentUrl
      }
    });

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