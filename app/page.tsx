import VerticalSlider from "../components/VerticalSlider";
import SubheaderHistory from "../components/SubheaderHistory";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="bg-white min-h-screen">
       <VerticalSlider />
       <SubheaderHistory />
       <Footer />
    </main>
  );
}
