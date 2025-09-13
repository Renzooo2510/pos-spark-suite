import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Store, 
  CreditCard, 
  Users, 
  Bell, 
  Shield,
  Save,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SystemSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  taxRate: number;
  currency: string;
  enableNotifications: boolean;
  enableInventoryAlerts: boolean;
  autoCompleteOrders: boolean;
  requireCustomerInfo: boolean;
}

export default function Settings() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>({
    storeName: "Spark Suite Coffee",
    storeAddress: "123 Coffee Street, City, State 12345",
    storePhone: "(555) 123-4567",
    taxRate: 8.25,
    currency: "USD",
    enableNotifications: true,
    enableInventoryAlerts: true,
    autoCompleteOrders: false,
    requireCustomerInfo: false,
  });
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('posSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage for now (in real app, save to database)
      localStorage.setItem('posSettings', JSON.stringify(settings));
      
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultSettings: SystemSettings = {
      storeName: "Spark Suite Coffee",
      storeAddress: "123 Coffee Street, City, State 12345",
      storePhone: "(555) 123-4567",
      taxRate: 8.25,
      currency: "USD",
      enableNotifications: true,
      enableInventoryAlerts: true,
      autoCompleteOrders: false,
      requireCustomerInfo: false,
    };
    setSettings(defaultSettings);
    setHasUnsavedChanges(true);
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Settings</h1>
            <p className="text-muted-foreground">
              Configure system settings and preferences.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="secondary">Unsaved changes</Badge>
            )}
            <Button onClick={handleReset} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <Store className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="business">
              <CreditCard className="h-4 w-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="system">
              <SettingsIcon className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={settings.storeName}
                      onChange={(e) => handleSettingChange('storeName', e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">Phone Number</Label>
                    <Input
                      id="storePhone"
                      value={settings.storePhone}
                      onChange={(e) => handleSettingChange('storePhone', e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Store Address</Label>
                  <Input
                    id="storeAddress"
                    value={settings.storeAddress}
                    onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
                    disabled={!isAdmin}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Business Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={settings.taxRate}
                      onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={settings.currency}
                      onChange={(e) => handleSettingChange('currency', e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Customer Information</Label>
                      <p className="text-sm text-muted-foreground">
                        Require customer name for all orders
                      </p>
                    </div>
                    <Switch
                      checked={settings.requireCustomerInfo}
                      onCheckedChange={(checked) => handleSettingChange('requireCustomerInfo', checked)}
                      disabled={!isAdmin}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-complete Orders</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically mark orders as completed after payment
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoCompleteOrders}
                      onCheckedChange={(checked) => handleSettingChange('autoCompleteOrders', checked)}
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{profile?.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <Badge variant="outline" className="mt-1">
                        {profile?.role}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </div>
                  
                  {!isAdmin && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Limited Access</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Contact an administrator to manage users and change system settings.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for orders and system events
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Inventory Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get alerts when inventory is running low
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableInventoryAlerts}
                    onCheckedChange={(checked) => handleSettingChange('enableInventoryAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Version</Label>
                    <p>POS Spark Suite v1.0.0</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p>2024-01-15</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Database Status</Label>
                    <Badge variant="default" className="mt-1">Connected</Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Environment</Label>
                    <p>Production</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}