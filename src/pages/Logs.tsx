import { DashboardLayout } from "@/components/Layout/DashboardLayout";

export default function Logs() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">System Logs</h1>
          <p className="text-muted-foreground">
            View system activity and audit trails.
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Logs system coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}