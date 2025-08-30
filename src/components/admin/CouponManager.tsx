import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Edit, Trash2, Tag, Percent } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CouponCode {
  id?: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  description: string;
}

export const CouponManager = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | null>(null);
  const [newCoupon, setNewCoupon] = useState<CouponCode>({
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    max_uses: null,
    used_count: 0,
    is_active: true,
    expires_at: null,
    description: ""
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons((data || []) as CouponCode[]);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCouponCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    if (editingCoupon) {
      setEditingCoupon({ ...editingCoupon, code: result });
    } else {
      setNewCoupon({ ...newCoupon, code: result });
    }
  };

  const handleSaveCoupon = async () => {
    const couponData = editingCoupon || newCoupon;
    
    if (!couponData.code || couponData.discount_value <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingCoupon) {
        const { error } = await supabase
          .from('coupon_codes')
          .update(couponData)
          .eq('id', editingCoupon.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coupon_codes')
          .insert([couponData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Coupon ${editingCoupon ? 'updated' : 'created'} successfully`
      });

      setIsDialogOpen(false);
      setEditingCoupon(null);
      setNewCoupon({
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        max_uses: null,
        used_count: 0,
        is_active: true,
        expires_at: null,
        description: ""
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        title: "Error",
        description: "Failed to save coupon",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('coupon_codes')
        .delete()
        .eq('id', couponId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coupon deleted successfully"
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive"
      });
    }
  };

  const toggleCouponStatus = async (coupon: CouponCode) => {
    try {
      const { error } = await supabase
        .from('coupon_codes')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Coupon ${!coupon.is_active ? 'activated' : 'deactivated'}`
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (coupon: CouponCode) => {
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const currentCoupon = editingCoupon || newCoupon;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupon Codes Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCoupon(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="code"
                    value={currentCoupon.code}
                    onChange={(e) => editingCoupon 
                      ? setEditingCoupon({...editingCoupon, code: e.target.value.toUpperCase()})
                      : setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})
                    }
                    placeholder="ENTER CODE"
                  />
                  <Button variant="outline" onClick={generateCouponCode}>
                    Generate
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type *</Label>
                <Select
                  value={currentCoupon.discount_type}
                  onValueChange={(value: 'percentage' | 'fixed') => editingCoupon
                    ? setEditingCoupon({...editingCoupon, discount_type: value})
                    : setNewCoupon({...newCoupon, discount_type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Discount Value * {currentCoupon.discount_type === 'percentage' ? '(%)' : '(₹)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={currentCoupon.discount_value}
                  onChange={(e) => editingCoupon
                    ? setEditingCoupon({...editingCoupon, discount_value: parseFloat(e.target.value)})
                    : setNewCoupon({...newCoupon, discount_value: parseFloat(e.target.value)})
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_uses">Max Uses (optional)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  placeholder="Unlimited"
                  value={currentCoupon.max_uses || ""}
                  onChange={(e) => editingCoupon
                    ? setEditingCoupon({...editingCoupon, max_uses: e.target.value ? parseInt(e.target.value) : null})
                    : setNewCoupon({...newCoupon, max_uses: e.target.value ? parseInt(e.target.value) : null})
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiry Date (optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={currentCoupon.expires_at || ""}
                  onChange={(e) => editingCoupon
                    ? setEditingCoupon({...editingCoupon, expires_at: e.target.value || null})
                    : setNewCoupon({...newCoupon, expires_at: e.target.value || null})
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={2}
                  value={currentCoupon.description}
                  onChange={(e) => editingCoupon
                    ? setEditingCoupon({...editingCoupon, description: e.target.value})
                    : setNewCoupon({...newCoupon, description: e.target.value})
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={currentCoupon.is_active}
                  onCheckedChange={(checked) => editingCoupon
                    ? setEditingCoupon({...editingCoupon, is_active: checked})
                    : setNewCoupon({...newCoupon, is_active: checked})
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCoupon}>
                <Save className="w-4 h-4 mr-2" />
                {editingCoupon ? 'Update' : 'Create'} Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading coupons...</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Code</th>
                    <th className="text-left p-4 font-medium">Discount</th>
                    <th className="text-left p-4 font-medium">Usage</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Expires</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-t">
                      <td className="p-4">
                        <div className="font-mono font-medium">{coupon.code}</div>
                        {coupon.description && (
                          <div className="text-sm text-muted-foreground">{coupon.description}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {coupon.discount_type === 'percentage' ? (
                            <Percent className="w-4 h-4 mr-1" />
                          ) : (
                            <span className="text-sm mr-1">₹</span>
                          )}
                          {coupon.discount_value}
                          {coupon.discount_type === 'percentage' && '%'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span>{coupon.used_count}</span>
                        {coupon.max_uses && <span> / {coupon.max_uses}</span>}
                      </td>
                      <td className="p-4">
                        <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {coupon.expires_at ? (
                          <span className="text-sm">
                            {new Date(coupon.expires_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(coupon)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => toggleCouponStatus(coupon)}
                          >
                            {coupon.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteCoupon(coupon.id!)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};