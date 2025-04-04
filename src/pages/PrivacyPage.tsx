import { SEO } from '@/components/SEO';

export default function PrivacyPage() {
  return (
    <>
      <SEO 
        title="Privacy Policy - MyHomeManager"
        description="Learn about how MyHomeManager collects, uses, and protects your personal information."
        keywords="privacy policy, data protection, GDPR, cookies, personal data"
      />
      
      <div className="container max-w-3xl py-8">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert">
          <p className="lead">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you:
          </p>
          <ul>
            <li>Create an account</li>
            <li>Use our services</li>
            <li>Contact us for support</li>
            <li>Fill out forms on our website</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Improve and personalize your experience</li>
            <li>Send you important updates and notifications</li>
            <li>Analyze usage patterns and optimize our website</li>
          </ul>

          <h2>3. Data Storage and Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.
          </p>

          <h2>4. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            Under applicable data protection laws, you have the following rights:
          </p>
          <ul>
            <li>Right to access your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
          </ul>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: privacy@myhomemanager.com<br />
            Address: [Your Business Address]
          </p>
        </div>
      </div>
    </>
  );
} 