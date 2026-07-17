import Link from "next/link";
import { ScanLine } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Card<span className="text-gradient">Scan</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-4">Last updated: July 2025</p>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <p>
              When you use CardScan Pro, we collect information you provide directly, including your
              name, email address, and password (stored in encrypted form). We also store business
              card data you scan or upload, including names, job titles, companies, email addresses,
              phone numbers, websites, and addresses extracted from your images.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
            <p>
              We use your information to provide and improve the CardScan Pro service, including
              processing business card images through our AI extraction system, managing your lead
              pipeline, and communicating with you about your account. We do not sell your personal
              information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Storage & Security</h2>
            <p>
              Your data is stored securely and is only accessible by you. We implement industry-standard
              security measures to protect your personal information. Business card data is processed
              through Google Gemini AI for extraction purposes only and is not used for model training.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Retention</h2>
            <p>
              We retain your account information and scanned data for as long as your account is active.
              You may delete your account and all associated data at any time from your Account Settings
              page. Upon deletion, your data is permanently removed from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Third-Party Services</h2>
            <p>
              We use Google Gemini AI for business card data extraction. We use NextAuth for
              authentication. These services process data according to their own privacy policies.
              We do not share your data with any other third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use
              tracking cookies or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any material
              changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us through the app
              or by email at support@cardscanpro.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
