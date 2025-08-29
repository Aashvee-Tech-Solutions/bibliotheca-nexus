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

    const { purchaseId, amount, phoneNumber } = await req.json();

    console.log('Processing payment for purchase:', purchaseId, 'Amount:', amount);

    // In a real implementation, you would integrate with PhonePe API here
    // For now, we'll simulate the payment process
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a mock payment ID
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // For demo purposes, we'll assume payment is successful
    const paymentStatus = 'completed';

    // Update the purchase record with payment details
    const { error: updateError } = await supabase
      .from('authorship_purchases')
      .update({
        payment_id: paymentId,
        payment_status: paymentStatus
      })
      .eq('id', purchaseId);

    if (updateError) {
      throw updateError;
    }

    console.log('Payment processed successfully:', paymentId);

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        status: paymentStatus,
        message: 'Payment processed successfully'
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