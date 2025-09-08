import { DashboardLayout } from "@/components/Layout/DashboardLayout";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed business insights and performance metrics.
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}