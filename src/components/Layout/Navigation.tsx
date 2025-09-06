import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  MenuIcon,
  Users,
  TrendingUp,
  FileText,
  Receipt,
  Package,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const navigationItems = [
  { name: "POS", href: "/", icon: ShoppingCart },
  { name: "Menu", href: "/menu", icon: MenuIcon },
  { name: "Accounts", href: "/accounts", icon: Users },
  { name: "Sales", href: "/sales", icon: Receipt },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Logs", href: "/logs", icon: FileText },
];

export function Navigation() {
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-card border-r border-border w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Orijins POS</h1>
        <p className="text-sm text-muted-foreground">Point of Sale System</p>
      </div>
      
      <div className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </nav>
  );
}