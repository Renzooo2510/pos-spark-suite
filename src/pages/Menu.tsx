import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  size: string;
  image_url?: string;
  is_available: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    size: "16oz",
    image_url: "",
    is_available: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("menu_items")
        .select(`
          *,
          categories(name)
        `)
        .order("name");

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddItem = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("menu_items")
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;

      setMenuItems(prev => [...prev, data]);
      setNewItem({
        name: "",
        description: "",
        price: 0,
        category_id: "",
        size: "16oz",
        image_url: "",
        is_available: true,
      });
      setIsAddingItem(false);

      toast({
        title: "Success",
        description: "Menu item added successfully",
      });
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const { data, error } = await (supabase as any)
        .from("menu_items")
        .update(editingItem)
        .eq("id", editingItem.id)
        .select()
        .single();

      if (error) throw error;

      setMenuItems(prev =>
        prev.map(item => item.id === editingItem.id ? data : item)
      );
      setEditingItem(null);

      toast({
        title: "Success",
        description: "Menu item updated successfully",
      });
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await (supabase as any)
        .from("menu_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMenuItems(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newItem.category_id}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="size">Size</Label>
                <select
                  id="size"
                  value={newItem.size}
                  onChange={(e) => setNewItem(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={categories.find(c => c.id === newItem.category_id)?.name === 'Hot Coffee'}
                >
                  {categories.find(c => c.id === newItem.category_id)?.name === 'Hot Coffee' ? (
                    <option value="8oz">8oz (Hot Coffee only)</option>
                  ) : (
                    <>
                      <option value="16oz">16oz</option>
                      <option value="22oz">22oz</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={newItem.is_available}
                  onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, is_available: checked }))}
                />
                <Label htmlFor="available">Available</Label>
              </div>
              <Button onClick={handleAddItem} className="w-full">
                Add Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map(item => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              <div className="flex justify-between items-center mb-2">
                <Badge variant={item.is_available ? "default" : "secondary"}>
                  {item.is_available ? "Available" : "Unavailable"}
                </Badge>
                <span className="font-bold text-lg">₱{item.price.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{(item as any).categories?.name}</Badge>
                <Badge variant="outline">{item.size}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  value={editingItem.category_id}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, category_id: e.target.value } : null)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-size">Size</Label>
                <select
                  id="edit-size"
                  value={editingItem.size}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, size: e.target.value } : null)}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={categories.find(c => c.id === editingItem.category_id)?.name === 'Hot Coffee'}
                >
                  {categories.find(c => c.id === editingItem.category_id)?.name === 'Hot Coffee' ? (
                    <option value="8oz">8oz (Hot Coffee only)</option>
                  ) : (
                    <>
                      <option value="16oz">16oz</option>
                      <option value="22oz">22oz</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-available"
                  checked={editingItem.is_available}
                  onCheckedChange={(checked) => setEditingItem(prev => prev ? { ...prev, is_available: checked } : null)}
                />
                <Label htmlFor="edit-available">Available</Label>
              </div>
              <Button onClick={handleUpdateItem} className="w-full">
                Update Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}