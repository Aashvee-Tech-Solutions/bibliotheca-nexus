import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Users, IndianRupee, BookOpen, Upload, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UpcomingBook {
  id: string;
  title: string;
  genre: string;
  description: string;
  cover_image_url: string;
  total_author_positions: number;
  available_positions: number;
  price_per_position: number;
  publication_date: string;
  copy_allocation: any;
}

interface PurchaseData {
  positions: number;
  phoneNumber: string;
  bio: string;
  profileImage: File | null;
  bankAccount: string;
  ifsc: string;
  accountHolderName: string;
  couponCode: string;
}

const Purchase = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [book, setBook] = useState<UpcomingBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    positions: 1,
    phoneNumber: '',
    bio: '',
    profileImage: null,
    bankAccount: '',
    ifsc: '',
    accountHolderName: '',
    couponCode: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (bookId) {
      fetchBook();
    }
  }, [bookId, user]);

  const fetchBook = async () => {
    try {
      const { data, error } = await supabase
        .from('upcoming_books')
        .select('*')
        .eq('id', bookId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Book not found');

      setBook(data);
    } catch (error) {
      console.error('Error fetching book:', error);
      toast({
        title: "Error",
        description: "Failed to load book details",
        variant: "destructive"
      });
      navigate('/upcoming-books');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!purchaseData.couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('code', purchaseData.couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error('Invalid coupon code');
      }

      // Check if coupon is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('Coupon has expired');
      }

      // Check if coupon has reached max uses
      if (data.max_uses && data.used_count >= data.max_uses) {
        throw new Error('Coupon usage limit reached');
      }

      const subtotal = calculateSubtotal();
      let discount = 0;

      if (data.discount_type === 'percentage') {
        discount = (subtotal * data.discount_value) / 100;
      } else {
        discount = data.discount_value;
      }

      setCouponDiscount(discount);
      setCouponApplied(true);
      toast({
        title: "Coupon Applied",
        description: `₹${discount.toLocaleString()} discount applied!`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setCouponApplied(false);
    setPurchaseData({ ...purchaseData, couponCode: "" });
    toast({
      title: "Coupon Removed",
      description: "Coupon discount has been removed"
    });
  };

  const calculateSubtotal = () => {
    if (!book) return 0;
    
    const allocation = book.copy_allocation?.[purchaseData.positions.toString()];
    if (allocation) {
      if (allocation.price) {
        return allocation.price;
      } else if (allocation.price_structure && allocation.price_structure.length > 0) {
        return allocation.price_structure[0]; // First author price
      }
    }
    
    return book.price_per_position * purchaseData.positions;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - couponDiscount);
  };

  const getPricingInfo = () => {
    if (!book?.copy_allocation) return null;
    
    const allocation = book.copy_allocation[purchaseData.positions.toString()];
    if (!allocation) return null;

    if (allocation.price) {
      return `₹${allocation.price.toLocaleString()} for ${allocation.copies} copies`;
    } else if (allocation.price_structure) {
      const prices = allocation.price_structure.map((p: number) => `₹${p.toLocaleString()}`).join(' + ');
      return `${prices} for ${allocation.copies} copies total`;
    }
    return null;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPurchaseData(prev => ({
      ...prev,
      profileImage: file
    }));
  };

  const handlePurchase = async () => {
    if (!book || !user) return;

    // Validation
    if (!purchaseData.phoneNumber || !purchaseData.bankAccount || !purchaseData.ifsc || !purchaseData.accountHolderName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setPurchasing(true);

    try {
      let profileImageUrl = null;

      // Upload profile image if provided
      if (purchaseData.profileImage) {
        setUploadingImage(true);
        const fileExt = purchaseData.profileImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, purchaseData.profileImage);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        profileImageUrl = data.publicUrl;
        setUploadingImage(false);
      }

      // Create purchase record
      const purchaseRecord = {
        upcoming_book_id: bookId,
        user_id: user.id,
        positions_purchased: purchaseData.positions,
        total_amount: calculateTotal(),
        bio: purchaseData.bio,
        profile_image_url: profileImageUrl,
        phone_number: purchaseData.phoneNumber,
        coupon_code: couponApplied ? purchaseData.couponCode : null,
        discount_amount: couponDiscount
      };

      const { data: purchase, error: purchaseError } = await supabase
        .from('authorship_purchases')
        .insert([purchaseRecord])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Process payment using Cashfree
      const { data: paymentData, error: paymentError } = await supabase.functions
        .invoke('payment-processor', {
          body: {
            purchaseId: purchase.id,
            amount: calculateTotal(),
            phoneNumber: purchaseData.phoneNumber,
            bankAccount: purchaseData.bankAccount,
            ifsc: purchaseData.ifsc,
            name: purchaseData.accountHolderName
          }
        });

      if (paymentError) throw paymentError;

      if (paymentData.success) {
        toast({
          title: "Purchase Successful!",
          description: "Your authorship position has been secured. You will receive a confirmation email shortly."
        });
        navigate('/dashboard');
      } else {
        throw new Error(paymentData.message || 'Payment failed');
      }

    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "There was an error processing your purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading book details...</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
            <Button onClick={() => navigate('/upcoming-books')}>
              Browse Other Books
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Book Details */}
            <Card>
              <CardHeader>
                <CardTitle>Book Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
                  <Badge variant="outline" className="mb-3">{book.genre}</Badge>
                  <p className="text-muted-foreground">{book.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      {book.available_positions}/{book.total_author_positions} positions available
                    </div>
                  </div>
                  
                  {book.publication_date && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="w-4 h-4 mr-1" />
                      Publication: {new Date(book.publication_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Purchase Form */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Authorship Position</CardTitle>
                <CardDescription>
                  Fill in your details to secure your co-authorship position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="positions">Number of Positions</Label>
                    <Select
                      value={purchaseData.positions.toString()}
                      onValueChange={(value) => setPurchaseData({...purchaseData, positions: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: Math.min(book.available_positions, 4)}, (_, i) => i + 1).map(num => {
                          const allocation = book.copy_allocation?.[num.toString()];
                          const price = allocation?.price || allocation?.price_structure?.[0] || book.price_per_position * num;
                          const copies = allocation?.copies || 2;
                          return (
                            <SelectItem key={num} value={num.toString()}>
                              {num} position{num > 1 ? 's' : ''} - ₹{price.toLocaleString()} ({copies} copies)
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {getPricingInfo() && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Pricing: {getPricingInfo()}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={purchaseData.phoneNumber}
                      onChange={(e) => setPurchaseData(prev => ({
                        ...prev,
                        phoneNumber: e.target.value
                      }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Briefly describe your professional background and expertise..."
                      value={purchaseData.bio}
                      onChange={(e) => setPurchaseData(prev => ({
                        ...prev,
                        bio: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="profileImage">Profile Image (Optional)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      {uploadingImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name *</Label>
                    <Input
                      id="accountHolder"
                      placeholder="As per bank records"
                      value={purchaseData.accountHolderName}
                      onChange={(e) => setPurchaseData(prev => ({
                        ...prev,
                        accountHolderName: e.target.value
                      }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bankAccount">Bank Account Number *</Label>
                    <Input
                      id="bankAccount"
                      placeholder="Account number"
                      value={purchaseData.bankAccount}
                      onChange={(e) => setPurchaseData(prev => ({
                        ...prev,
                        bankAccount: e.target.value
                      }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="ifsc">IFSC Code *</Label>
                    <Input
                      id="ifsc"
                      placeholder="IFSC Code"
                      value={purchaseData.ifsc}
                      onChange={(e) => setPurchaseData(prev => ({
                        ...prev,
                        ifsc: e.target.value.toUpperCase()
                      }))}
                      required
                    />
                  </div>

                  {/* Coupon Code Section */}
                  <div>
                    <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="couponCode"
                        placeholder="Enter coupon code"
                        value={purchaseData.couponCode}
                        onChange={(e) => setPurchaseData({...purchaseData, couponCode: e.target.value.toUpperCase()})}
                        disabled={couponApplied}
                      />
                      {!couponApplied ? (
                        <Button type="button" variant="outline" onClick={applyCoupon}>
                          <Tag className="w-4 h-4 mr-1" />
                          Apply
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" onClick={removeCoupon}>
                          Remove
                        </Button>
                      )}
                    </div>
                    {couponApplied && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Coupon applied: ₹{couponDiscount.toLocaleString()} discount
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Total Amount */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  {couponApplied && (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Subtotal</span>
                        <span className="flex items-center">
                          <IndianRupee className="w-4 h-4" />
                          {calculateSubtotal().toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-green-600">
                        <span>Discount ({purchaseData.couponCode})</span>
                        <span className="flex items-center">
                          -<IndianRupee className="w-4 h-4" />
                          {couponDiscount.toLocaleString()}
                        </span>
                      </div>
                      <hr className="my-2" />
                    </>
                  )}
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="flex items-center">
                      <IndianRupee className="w-5 h-5" />
                      {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={purchasing || book.available_positions === 0}
                  className="w-full"
                  size="lg"
                >
                  {purchasing ? "Processing..." : `Pay ₹${totalAmount.toLocaleString()}`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By proceeding with payment, you agree to our{" "}
                  <a href="/terms" className="underline">Terms and Conditions</a>{" "}
                  and <a href="/privacy" className="underline">Privacy Policy</a>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchase;