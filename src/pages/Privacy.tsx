import Header from "@/components/Header";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Information We Collect</h2>
              <p>
                AASHVEE Publishers collects information you provide directly to us, such as when you create an account, submit a manuscript, or purchase authorship positions.
              </p>
              
              <h3 className="text-xl font-medium mt-4 mb-2 text-foreground">Personal Information</h3>
              <ul className="list-disc ml-6">
                <li>Name and contact information (email, phone number, address)</li>
                <li>Professional credentials and biography</li>
                <li>Payment information (processed securely by our payment partners)</li>
                <li>Manuscript content and related documents</li>
                <li>Profile images and other uploaded content</li>
              </ul>

              <h3 className="text-xl font-medium mt-4 mb-2 text-foreground">Automatically Collected Information</h3>
              <ul className="list-disc ml-6">
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
                <li>Usage patterns and preferences</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Provide and improve our publishing services</li>
                <li>Process authorship purchases and payments</li>
                <li>Communicate with you about your account and services</li>
                <li>Send promotional materials (with your consent)</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Analyze usage patterns to improve our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Information Sharing</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:</p>
              <ul className="list-disc ml-6 mt-2">
                <li><strong>Service Providers:</strong> Trusted partners who assist in our operations</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                <li><strong>Co-authors:</strong> Limited sharing for collaborative publishing projects</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure payment processing through certified providers</li>
                <li>Regular backup and recovery procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Data Retention</h2>
              <p>
                We retain your information for as long as necessary to provide services and fulfill legal obligations. Specific retention periods include:
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li><strong>Account Information:</strong> Until account deletion or 7 years after last activity</li>
                <li><strong>Manuscript Data:</strong> Until publication completion or withdrawal</li>
                <li><strong>Payment Records:</strong> As required by financial regulations (typically 7 years)</li>
                <li><strong>Marketing Data:</strong> Until you unsubscribe or opt-out</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Your Rights</h2>
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc ml-6 mt-2">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data</li>
                <li><strong>Restriction:</strong> Request limitation of processing</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.
              </p>
              <h3 className="text-xl font-medium mt-4 mb-2 text-foreground">Types of Cookies We Use:</h3>
              <ul className="list-disc ml-6">
                <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Deliver relevant advertising (with consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. International Data Transfers</h2>
              <p>
                Your information may be processed in countries other than your residence. We ensure appropriate safeguards are in place for international transfers in compliance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 18. We do not knowingly collect personal information from children. If we become aware of such collection, we will take steps to delete the information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Changes to This Policy</h2>
              <p>
                We may update this privacy policy periodically. We will notify you of significant changes through email or prominent website notices. Your continued use constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Contact Us</h2>
              <p>
                If you have questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="mt-2">
                <p><strong>Email:</strong> privacy@aashveetech.com</p>
                <p><strong>Phone:</strong> +91 9025033635</p>
                <p><strong>Address:</strong> Chennai, Tamil Nadu, India</p>
              </div>
            </section>

            <footer className="mt-12 pt-6 border-t text-sm text-muted-foreground">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <p>© 2025 AASHVEE Publishers. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;