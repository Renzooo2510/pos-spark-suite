import { DashboardLayout } from "@/components/Layout/DashboardLayout";

export default function Accounts() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Account Management</h1>
          <p className="text-muted-foreground">
            Manage staff accounts and user roles.
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Account management system coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}