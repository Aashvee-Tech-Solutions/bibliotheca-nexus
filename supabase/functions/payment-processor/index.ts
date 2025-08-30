import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { purchase_id, amount, bank_details } = await req.json();
    const { account_number, ifsc_code, bank_name, account_holder_name } = bank_details;

    console.log('Processing Cashfree payment for purchase:', purchase_id, 'Amount:', amount);

    // Cashfree Payment Integration
    const cashfreeUrl = 'https://sandbox.cashfree.com/verification/bank-account/sync';
    
    const cashfreePayload = {
      bank_account: account_number,
      ifsc: ifsc_code,
      name: account_holder_name,
      phone: "9999999999" // Default phone for verification
    };

    const cashfreeHeaders = {
      'Content-Type': 'application/json',
      'x-client-id': Deno.env.get('CASHFREE_CLIENT_ID') ?? '',
      'x-client-secret': Deno.env.get('CASHFREE_CLIENT_SECRET') ?? ''
    };

    console.log('Making Cashfree bank verification request...');
    
    const cashfreeResponse = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: cashfreeHeaders,
      body: JSON.stringify(cashfreePayload)
    });

    const cashfreeResult = await cashfreeResponse.json();
    
    console.log('Cashfree verification response:', cashfreeResult);

    let paymentStatus = 'failed';
    let paymentId = `CF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if bank verification was successful
    if (cashfreeResult.account_status === 'VALID') {
      paymentStatus = 'completed';
      paymentId = cashfreeResult.utr || paymentId;
      
      console.log('Bank verification successful, processing payment...');
    } else {
      console.log('Bank verification failed:', cashfreeResult.account_status_code);
      throw new Error(`Bank verification failed: ${cashfreeResult.account_status_code || 'Invalid bank details'}`);
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
        payment_id: paymentId,
        payment_status: paymentStatus,
        payment_details: JSON.stringify({
          cashfree_response: cashfreeResult,
          verification_score: cashfreeResult.name_match_score,
          bank_name: cashfreeResult.bank_name
        })
      })
      .eq('id', purchase_id);

    if (updateError) {
      throw updateError;
    }

    console.log('Payment processed successfully:', paymentId);

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        status: paymentStatus,
        message: 'Payment processed successfully',
        bankVerification: {
          nameMatchScore: cashfreeResult.name_match_score,
          bankName: cashfreeResult.bank_name,
          accountStatus: cashfreeResult.account_status
        }
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
        message: 'Payment processing failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});