import { DashboardLayout } from "@/components/Layout/DashboardLayout";

export default function Orders() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Order Management</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders in real-time.
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order management system coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}