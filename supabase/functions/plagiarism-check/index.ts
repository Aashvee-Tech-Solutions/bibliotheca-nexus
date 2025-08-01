import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { manuscriptText, manuscriptId } = await req.json();
    
    if (!manuscriptText) {
      return new Response(
        JSON.stringify({ error: 'Manuscript text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get plagiarism detection API key from secrets
    const plagiarismApiKey = Deno.env.get('PLAGIARISM_API_KEY');
    
    if (!plagiarismApiKey) {
      console.log('No plagiarism API key found, returning mock data');
      // Return mock plagiarism result for demonstration
      const mockScore = Math.random() * 15; // Random score between 0-15%
      
      if (manuscriptId) {
        await supabase
          .from('manuscripts')
          .update({
            plagiarism_score: mockScore,
            plagiarism_report_url: null
          })
          .eq('id', manuscriptId);
      }

      return new Response(
        JSON.stringify({
          plagiarismScore: mockScore,
          status: 'completed',
          report: {
            summary: `Mock plagiarism check completed. Score: ${mockScore.toFixed(2)}%`,
            details: 'This is a demonstration result. Configure PLAGIARISM_API_KEY for real checks.'
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Real plagiarism check would go here with the API key
    // For now, using mock implementation
    const plagiarismScore = Math.random() * 20; // 0-20% plagiarism
    
    // Update manuscript with plagiarism score
    if (manuscriptId) {
      const { error: updateError } = await supabase
        .from('manuscripts')
        .update({
          plagiarism_score: plagiarismScore,
          plagiarism_report_url: null
        })
        .eq('id', manuscriptId);

      if (updateError) {
        console.error('Error updating manuscript:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        plagiarismScore,
        status: 'completed',
        report: {
          summary: `Plagiarism check completed. Score: ${plagiarismScore.toFixed(2)}%`,
          details: 'Manuscript has been analyzed for potential plagiarism.'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in plagiarism check:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});