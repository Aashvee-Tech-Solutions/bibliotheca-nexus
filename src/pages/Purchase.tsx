import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, IndianRupee, Users, Calendar, CreditCard, User, MapPin, Phone, FileText, Tag } from "lucide-react";

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
  copy_allocation?: any;
  position_pricing?: any;
  purchased_positions?: any[];
  authorship_purchases?: any[];
}

const Purchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [book, setBook] = useState<UpcomingBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [availablePositions, setAvailablePositions] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState({ amount: 0, type: 'percentage' });
  const [finalAmount, setFinalAmount] = useState(0);
  
  const [formData, setFormData] = useState({
    bio: "",
    phone_number: "",
    bank_account_number: "",
    bank_ifsc_code: "",
    bank_name: "",
    account_holder_name: ""
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBookDetails();
  }, [id, user]);

  const fetchBookDetails = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('upcoming_books')
        .select(`
          *,
          authorship_purchases (
            id,
            user_id,
            position_purchased,
            payment_status,
            total_amount,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Error",
          description: "Book not found",
          variant: "destructive"
        });
        navigate('/upcoming-books');
        return;
      }

      // Get position pricing from copy_allocation
      const positions = data.copy_allocation?.[data.total_author_positions.toString()]?.positions || [];
      const purchasedPositions = data.authorship_purchases?.filter((p: any) => p.payment_status === 'completed').map((p: any) => p.position_purchased) || [];
      
      const available = positions.filter((pos: any) => !purchasedPositions.includes(pos.position));
      
      setBook({ ...data, purchased_positions: data.authorship_purchases });
      setAvailablePositions(available);
      
      if (available.length > 0) {
        setSelectedPosition(available[0].position);
        setFinalAmount(available[0].price);
      }
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
    if (!couponCode || !selectedPosition) return;
    
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid Coupon",
          description: "Coupon code not found or expired",
          variant: "destructive"
        });
        return;
      }

      const selectedPositionData = availablePositions.find(p => p.position === selectedPosition);
      if (!selectedPositionData) return;

      let discountAmount = 0;
      if (data.discount_type === 'percentage') {
        discountAmount = (selectedPositionData.price * data.discount_value) / 100;
      } else {
        discountAmount = data.discount_value;
      }

      setDiscount({ amount: discountAmount, type: data.discount_type });
      setFinalAmount(selectedPositionData.price - discountAmount);
      
      toast({
        title: "Coupon Applied",
        description: `Discount of ₹${discountAmount.toLocaleString()} applied successfully`
      });
    } catch (error) {
      console.error('Error applying coupon:', error);
    }
  };

  const handlePositionChange = (position: string) => {
    const pos = parseInt(position);
    setSelectedPosition(pos);
    const positionData = availablePositions.find(p => p.position === pos);
    if (positionData) {
      const basePrice = positionData.price;
      const discountAmount = discount.amount;
      setFinalAmount(basePrice - discountAmount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!user || !book || !selectedPosition) return;

    // Validate form
    if (!formData.bio || !formData.phone_number || !formData.bank_account_number || 
        !formData.bank_ifsc_code || !formData.bank_name || !formData.account_holder_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('authorship_purchases')
        .insert([{
          upcoming_book_id: book.id,
          user_id: user.id,
          position_purchased: selectedPosition,
          total_amount: finalAmount,
          bio: formData.bio,
          phone_number: formData.phone_number,
          payment_status: 'pending',
          coupon_code: couponCode || null,
          discount_amount: discount.amount,
          payment_details: {
            bank_account_number: formData.bank_account_number,
            bank_ifsc_code: formData.bank_ifsc_code,
            bank_name: formData.bank_name,
            account_holder_name: formData.account_holder_name
          }
        }])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Process payment via edge function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('payment-processor', {
        body: {
          purchase_id: purchase.id,
          amount: finalAmount,
          bank_details: {
            account_number: formData.bank_account_number,
            ifsc_code: formData.bank_ifsc_code,
            bank_name: formData.bank_name,
            account_holder_name: formData.account_holder_name
          },
          book_title: book.title,
          position: selectedPosition
        }
      });

      if (paymentError) throw paymentError;

      if (paymentData?.success) {
        toast({
          title: "Purchase Successful!",
          description: "Your authorship position has been secured. Payment verification in progress."
        });
        navigate('/dashboard');
      } else {
        throw new Error(paymentData?.message || 'Payment processing failed');
      }

    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to complete purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
          {/* Book Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Book Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[3/4] relative overflow-hidden rounded-lg max-w-xs mx-auto">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{book.title}</h3>
                <Badge variant="outline" className="mb-3">{book.genre}</Badge>
                <p className="text-muted-foreground text-sm">{book.description}</p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-muted-foreground" />
                  <span>Available Positions: {availablePositions.length}/{book.total_author_positions}</span>
                </div>
                <Badge variant={availablePositions.length > 0 ? "default" : "secondary"}>
                  {availablePositions.length > 0 ? "Available" : "Sold Out"}
                </Badge>
              </div>

              {book.publication_date && (
                <div className="flex items-center mb-4">
                  <Calendar className="w-5 h-5 mr-2 text-muted-foreground" />
                  <span>Publication Date: {new Date(book.publication_date).toLocaleDateString()}</span>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold">Position Pricing:</h4>
                {book.copy_allocation?.[book.total_author_positions.toString()]?.positions?.map((pos: any, idx: number) => {
                  const isPurchased = book.purchased_positions?.some((purchase: any) => 
                    purchase.payment_status === 'completed' && purchase.position_purchased === pos.position
                  );
                  return (
                    <div key={idx} className={`p-3 border rounded-lg ${isPurchased ? 'bg-muted opacity-50' : 'bg-background'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">Position {pos.position}</span>
                          {isPurchased && <Badge variant="secondary" className="ml-2">Sold</Badge>}
                        </div>
                        <div className="flex items-center font-bold text-lg">
                          <IndianRupee className="w-4 h-4" />
                          {pos.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Book copies per author:</div>
                <div className="font-medium">
                  {book.copy_allocation?.[book.total_author_positions.toString()]?.copies || 0} copies
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Purchase Authorship Position
              </CardTitle>
              <CardDescription>
                Complete your information to secure your co-authorship position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {availablePositions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lg font-medium mb-2">All positions are sold out</p>
                  <p className="text-muted-foreground">This book is no longer available for purchase.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Position Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="position">Select Author Position</Label>
                    <Select value={selectedPosition?.toString()} onValueChange={handlePositionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your position" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePositions.map((pos) => (
                          <SelectItem key={pos.position} value={pos.position.toString()}>
                            Position {pos.position} - ₹{pos.price.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Coupon Code */}
                  <div className="space-y-2">
                    <Label htmlFor="coupon">Coupon Code (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                      />
                      <Button type="button" variant="outline" onClick={applyCoupon}>
                        <Tag className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Personal Information
                    </h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio *</Label>
                      <Textarea
                        id="bio"
                        placeholder="Briefly describe your professional background and expertise..."
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Bank Account Details (For Verification)
                    </h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="account_holder">Account Holder Name *</Label>
                      <Input
                        id="account_holder"
                        placeholder="As per bank records"
                        value={formData.account_holder_name}
                        onChange={(e) => setFormData({...formData, account_holder_name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank_account">Bank Account Number *</Label>
                      <Input
                        id="bank_account"
                        placeholder="Account number"
                        value={formData.bank_account_number}
                        onChange={(e) => setFormData({...formData, bank_account_number: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ifsc">IFSC Code *</Label>
                      <Input
                        id="ifsc"
                        placeholder="IFSC Code"
                        value={formData.bank_ifsc_code}
                        onChange={(e) => setFormData({...formData, bank_ifsc_code: e.target.value.toUpperCase()})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name *</Label>
                      <Input
                        id="bank_name"
                        placeholder="Bank name"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold">Payment Summary</h4>
                    {selectedPosition && (
                      <>
                        <div className="flex justify-between">
                          <span>Position {selectedPosition}:</span>
                          <span>₹{availablePositions.find(p => p.position === selectedPosition)?.price.toLocaleString()}</span>
                        </div>
                        {discount.amount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount ({couponCode}):</span>
                            <span>-₹{discount.amount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total Amount:</span>
                          <span className="flex items-center">
                            <IndianRupee className="w-4 h-4" />
                            {finalAmount.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={submitting || !selectedPosition}
                  >
                    {submitting ? "Processing..." : `Complete Purchase - ₹${finalAmount.toLocaleString()}`}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Purchase;