import HeroSection from '../components/landing/HeroSection';
import HowItWorks from '../components/landing/HowItWorks';
import FeatureBentoGrid from '../components/landing/FeatureBentoGrid';
import ImpactBanner from '../components/landing/ImpactBanner';
import DashboardPreview from '../components/landing/DashboardPreview';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/common/Footer';

export default function LandingPage() {
  return (
    <div className="global-grid-bg min-h-screen">
      <HeroSection />
      <HowItWorks />
      <FeatureBentoGrid />
      <ImpactBanner />
      <DashboardPreview />
      <CTASection />
      <Footer />
    </div>
  );
}
