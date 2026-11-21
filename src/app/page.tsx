import Hero from "@/components/home/Hero";
import TrustTicker from "@/components/home/TrustTicker";
import FeaturedSection from "@/components/home/FeaturedSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import HowItWorks from "@/components/home/HowItWorks";
import ReviewsSection from "@/components/home/ReviewsSection";
import OwnerCTA from "@/components/home/OwnerCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustTicker />
      <FeaturedSection />
      <CategoriesSection />
      <WhyChooseUs />
      <HowItWorks />
      <ReviewsSection />
      <OwnerCTA />
    </>
  );
}
