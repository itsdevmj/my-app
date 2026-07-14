import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import ScrollProgress from "./components/ScrollProgress";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MarqueeBand from "./components/MarqueeBand";
import Showcase from "./components/Showcase";
import Services from "./components/Services";
import About from "./components/About";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Preloader />
      <Cursor />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <MarqueeBand />
        <Showcase />
        <Services />
        <About />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
