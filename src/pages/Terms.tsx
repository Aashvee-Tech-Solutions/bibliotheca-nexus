import Header from "@/components/Header";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Terms and Conditions</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Aashvee Publishers' services, you accept and agree to be bound by the terms and provisions of this agreement. 
                <strong className="text-foreground"> Aashvee Publishers is the publishing imprint of Aashvee Tech Solutions Pvt. Ltd.</strong> 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Publishing Services</h2>
              <p>
                AASHVEE Publishers (an imprint of AASHVEE Tech Solutions Pvt. Ltd.) provides comprehensive publishing services including manuscript evaluation, editing, design, printing, and distribution. 
                All services are subject to our professional standards and quality requirements.
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>Manuscript submission and review process</li>
                <li>Editorial and design services</li>
                <li>Publishing and distribution rights</li>
                <li>Marketing and promotional support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Authorship Marketplace</h2>
              <p>
                Our authorship marketplace allows qualified individuals to purchase co-authorship positions in upcoming publications. By participating, you agree to:
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>Provide accurate personal and professional information</li>
                <li>Meet all deadlines and requirements specified for your authorship position</li>
                <li>Contribute meaningfully to the publication as agreed</li>
                <li>Maintain professional standards and ethical conduct</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Payment Terms</h2>
              <p>
                All payments for services and authorship positions are processed securely through our payment gateway. Payment terms include:
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>Full payment required at time of booking</li>
                <li>Refunds subject to our refund policy</li>
                <li><strong className="text-red-600">No refunds are provided after the payment is completed.</strong></li>
                <li>All prices include applicable taxes</li>
                <li>Currency conversions at current market rates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Intellectual Property</h2>
              <p>
                Authors retain ownership of their original work. AASHVEE Publishers (imprint of AASHVEE Tech Solutions Pvt. Ltd.) obtains necessary rights for publication, distribution, and marketing as outlined in individual agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Quality Standards</h2>
              <p>
                All publications must meet our quality standards including:
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>Original content free from plagiarism</li>
                <li>Professional writing and presentation standards</li>
                <li>Compliance with publishing industry guidelines</li>
                <li>Adherence to ethical publishing practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Limitation of Liability</h2>
              <p>
                AASHVEE Publishers' liability is limited to the amount paid for services. We are not responsible for indirect, consequential, or punitive damages arising from the use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Privacy and Data Protection</h2>
              <p>
                We are committed to protecting your privacy and personal information in accordance with applicable data protection laws. Please refer to our Privacy Policy for detailed information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Modifications</h2>
              <p>
                AASHVEE Publishers reserves the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Continued use of our services constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Contact Information</h2>
              <p>
                For questions regarding these terms and conditions, please contact us at:
              </p>
              <div className="mt-2">
                <p><strong>Email:</strong> info@aashveetech.com</p>
                <p><strong>Phone:</strong> +91 6281614117</p>
                <p><strong>Address:</strong> Hyderabad, Telangana, India</p>
              </div>
            </section>

            <footer className="mt-12 pt-6 border-t text-sm text-muted-foreground">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <p>© 2025 AASHVEE Tech Solutions Pvt. Ltd. | AASHVEE Publishers (Imprint).</p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
