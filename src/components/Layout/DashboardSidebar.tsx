import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Coffee,
  ClipboardList,
  DollarSign,
  Users,
  MenuIcon,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3, roles: ["admin", "owner", "manager", "cashier", "staff"] },
  { name: "Orders", href: "/orders", icon: ClipboardList, roles: ["admin", "owner", "manager", "cashier", "staff"] },
  { name: "POS", href: "/pos", icon: CreditCard, roles: ["admin", "owner", "manager", "cashier", "staff"] },
  { name: "Sales", href: "/sales", icon: DollarSign, roles: ["admin", "owner", "manager", "cashier", "staff"] },
  { name: "Menu", href: "/menu", icon: MenuIcon, roles: ["admin", "owner", "manager"] },
  { name: "Accounts", href: "/accounts", icon: Users, roles: ["admin", "owner"] },
  { name: "Analytics", href: "/analytics", icon: TrendingUp, roles: ["admin", "owner", "manager"] },
  { name: "Logs", href: "/logs", icon: FileText, roles: ["admin", "owner"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["admin", "owner"] },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredItems = navigationItems.filter(item => 
    !profile || item.roles.includes(profile.role)
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 px-4 py-2">
            <Coffee className="h-6 w-6 text-primary" />
            {!collapsed && (
              <div>
                <div className="font-bold text-primary">Orijin's Coffee</div>
                <div className="text-xs text-muted-foreground">Staff Portal</div>
              </div>
            )}
          </SidebarGroupLabel>
          
          {profile && !collapsed && (
            <div className="px-4 py-2 mb-2 bg-muted/50 mx-2 rounded-lg">
              <div className="text-sm font-medium">{profile.full_name}</div>
              <div className="text-xs text-muted-foreground capitalize">{profile.role}</div>
            </div>
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className={collapsed ? "w-10 h-10 p-0" : "w-full justify-start"}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}