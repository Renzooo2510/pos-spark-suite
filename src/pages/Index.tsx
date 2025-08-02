import { Navigation } from "@/components/Layout/Navigation";
import { POSSystem } from "@/components/POS/POSSystem";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <div className="flex-1">
        <POSSystem />
      </div>
    </div>
  );
};

export default Index;
