import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Shield, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PaymentService } from "@/lib/paymentService";
import { supabase } from "@/integrations/supabase/client";

interface BookPurchaseData {
  bookId: string;
  title: string;
  price: number;
  type: string;
}

const PurchaseBook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState<BookPurchaseData | null>(null);
  const [userDetails, setUserDetails] = useState({
    phone_number: "",
    name: user?.user_metadata?.full_name || ""
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: window.location.pathname + window.location.search } } });
      return;
    }

    const data = searchParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data));
        setPurchaseData(decoded);
      } catch (error) {
        console.error('Error parsing purchase data:', error);
        toast({
          title: "Error",
          description: "Invalid purchase data",
          variant: "destructive"
        });
        navigate('/books');
      }
    } else {
      navigate('/books');
    }
  }, [user, navigate, searchParams]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseData || !user) return;

    setLoading(true);

    try {
      // Validate inputs
      if (!userDetails.phone_number || !userDetails.name) {
        throw new Error('Please fill in all required fields');
      }

      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(userDetails.phone_number)) {
        throw new Error('Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9');
      }

      // Create a purchase record in authorship_purchases for now
      // This will be used for book purchases as well
      const { data: purchase, error: purchaseError } = await supabase
        .from('authorship_purchases')
        .insert([{
          upcoming_book_id: purchaseData.bookId,
          user_id: user.id,
          total_amount: purchaseData.price,
          payment_status: 'pending',
          positions_purchased: 1,
          phone_number: userDetails.phone_number
        }])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Initiate PhonePe payment
      const response = await PaymentService.initiatePhonePePayment(
        purchase.id,
        purchaseData.price,
        userDetails
      );

      if (response.success && response.paymentUrl) {
        toast({
          title: "Redirecting to PhonePe",
          description: "Please complete your payment on PhonePe"
        });
        
        // Redirect to PhonePe
        setTimeout(() => {
          window.location.href = response.paymentUrl!;
        }, 1000);
      } else {
        throw new Error(response.error || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Error",
        description: error.message || "Failed to initiate purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!purchaseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading purchase details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/books')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Books
            </Button>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Purchase Book</h1>
            <p className="text-muted-foreground mt-2">
              Complete your book purchase securely with PhonePe
            </p>
          </div>

          <div className="grid gap-8">
            {/* Purchase Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{purchaseData.title}</h3>
                    <p className="text-sm text-muted-foreground">Physical Book</p>
                    <Badge variant="secondary" className="mt-1">
                      Direct Purchase
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Book Price</span>
                    <span>₹{purchaseData.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{purchaseData.price.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Security Features */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Secure PhonePe payment gateway</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Fast shipping to your address</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Enter your details to proceed with PhonePe payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePurchase} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone-number">Phone Number *</Label>
                      <Input
                        id="phone-number"
                        value={userDetails.phone_number}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, phone_number: e.target.value }))}
                        placeholder="Enter your 10-digit phone number"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        This phone number will be used for PhonePe payment
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="holder-name">Full Name *</Label>
                      <Input
                        id="holder-name"
                        value={userDetails.name}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Button */}
                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Initiating Payment...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5 mr-2" />
                        Pay ₹{purchaseData.price.toLocaleString()} with PhonePe
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By completing this purchase, you agree to our{' '}
                    <span className="text-primary cursor-pointer hover:underline">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-primary cursor-pointer hover:underline">
                      Privacy Policy
                    </span>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PurchaseBook;
