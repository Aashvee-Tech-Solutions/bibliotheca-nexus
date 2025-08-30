import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'contact' | 'manuscript';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, type }: ContactEmailRequest = await req.json();

    console.log(`Processing ${type} email from:`, email);

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Aashvee Publishing <noreply@resend.dev>",
      to: ["mis@aashveetech.com"],
      subject: `New ${type === 'manuscript' ? 'Manuscript Submission' : 'Contact Form'}: ${subject}`,
      html: `
        <h2>New ${type === 'manuscript' ? 'Manuscript Submission' : 'Contact Form Submission'}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div>
          <strong>Message:</strong>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        <hr>
        <p><em>Received at: ${new Date().toLocaleString()}</em></p>
      `,
    });

    // Send confirmation to user
    const userEmailResponse = await resend.emails.send({
      from: "Aashvee Publishing <noreply@resend.dev>",
      to: [email],
      subject: `Thank you for your ${type === 'manuscript' ? 'manuscript submission' : 'message'}!`,
      html: `
        <h2>Thank you for contacting Aashvee Publishing, ${name}!</h2>
        <p>We have received your ${type === 'manuscript' ? 'manuscript submission' : 'message'} and will get back to you as soon as possible.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Your ${type === 'manuscript' ? 'Submission' : 'Message'} Details:</h3>
          <p><strong>Subject:</strong> ${subject}</p>
          <div>
            <strong>Message:</strong>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        
        <p>Best regards,<br>The Aashvee Publishing Team</p>
      `,
    });

    console.log("Emails sent successfully:", { adminEmailResponse, userEmailResponse });

    return new Response(JSON.stringify({ 
      success: true, 
      adminEmailId: adminEmailResponse.data?.id,
      userEmailId: userEmailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);