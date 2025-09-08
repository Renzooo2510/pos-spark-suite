import { DashboardLayout } from "@/components/Layout/DashboardLayout";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and preferences.
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Settings panel coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}