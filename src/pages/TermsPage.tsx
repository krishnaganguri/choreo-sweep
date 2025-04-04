import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, MapPin } from 'lucide-react';

export default function TermsPage() {
  return (
    <>
      <SEO 
        title="Terms of Service - MyHomeManager"
        description="Read the terms and conditions for using MyHomeManager's services."
        keywords="terms of service, terms and conditions, user agreement, legal terms"
      />
      
      <div className="container max-w-4xl py-12">
        <div className="space-y-2 text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <Card className="border-none shadow-none">
          <CardContent className="prose prose-slate dark:prose-invert max-w-none p-6">
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-semibold tracking-tight">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using MyHomeManager ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">2. Description of Service</h2>
                <p className="text-muted-foreground mb-4">
                  MyHomeManager is a home management platform that provides tools for:
                </p>
                <ul className="grid gap-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    • Managing household tasks and chores
                  </li>
                  <li className="flex items-center gap-2">
                    • Creating and managing grocery lists
                  </li>
                  <li className="flex items-center gap-2">
                    • Tracking family expenses
                  </li>
                  <li className="flex items-center gap-2">
                    • Setting reminders and notifications
                  </li>
                  <li className="flex items-center gap-2">
                    • Coordinating family activities
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">3. User Accounts</h2>
                <p className="text-muted-foreground mb-4">
                  To use the Service, you must:
                </p>
                <ul className="grid gap-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    • Create an account with accurate information
                  </li>
                  <li className="flex items-center gap-2">
                    • Maintain the security of your account credentials
                  </li>
                  <li className="flex items-center gap-2">
                    • Promptly notify us of any unauthorized use
                  </li>
                  <li className="flex items-center gap-2">
                    • Be at least 13 years of age
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">4. User Responsibilities</h2>
                <p className="text-muted-foreground mb-4">
                  You agree to:
                </p>
                <ul className="grid gap-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    • Use the Service in compliance with all applicable laws
                  </li>
                  <li className="flex items-center gap-2">
                    • Not share account credentials with unauthorized users
                  </li>
                  <li className="flex items-center gap-2">
                    • Not use the Service for any illegal or unauthorized purpose
                  </li>
                  <li className="flex items-center gap-2">
                    • Not interfere with or disrupt the Service
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">5. Data Usage and Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to the collection and use of information as detailed in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">6. Service Modifications</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify or discontinue the Service at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">7. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users of the Service, us, or third parties, or for any other reason.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">8. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service is provided "as is" without any warranties, expressed or implied. We do not warrant that the Service will be uninterrupted or error-free.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">9. Contact Information</h2>
                <p className="text-muted-foreground mb-6">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <div className="grid gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>terms@myhomemanager.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>[Your Business Address]</span>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 