import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { POSSystem } from "@/components/POS/POSSystem";

export default function POS() {
  return (
    <DashboardLayout>
      <POSSystem />
    </DashboardLayout>
  );
}