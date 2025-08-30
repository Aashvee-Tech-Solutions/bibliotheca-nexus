import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Smartphone, Shield, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentService } from "@/lib/paymentService";

const PaymentGateway = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "", // Will be used for phone number
    accountHolderName: ""
  });

  // Get purchase ID from URL params
  const purchaseId = searchParams.get('purchaseId');

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: '/payment-gateway' } } });
      return;
    }

    if (purchaseId) {
      fetchPurchaseData();
    }
  }, [user, navigate, purchaseId]);

  const fetchPurchaseData = async () => {
    if (!purchaseId) return;

    try {
      const { data, error } = await supabase
        .from('authorship_purchases')
        .select(`
          *,
          upcoming_books (
            title,
            genre,
            cover_image_url
          )
        `)
        .eq('id', purchaseId)
        .single();

      if (error) throw error;

      setPurchaseData(data);
      setTotalAmount(data.total_amount);
    } catch (error) {
      console.error('Error fetching purchase data:', error);
      toast({
        title: "Error",
        description: "Failed to load purchase data",
        variant: "destructive"
      });
      navigate('/upcoming-books');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!bankDetails.accountNumber || !bankDetails.accountHolderName) {
        throw new Error('Please fill in all required fields');
      }

      // Validate phone number format
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(bankDetails.accountNumber)) {
        throw new Error('Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9');
      }

      // Validate name
      if (bankDetails.accountHolderName.trim().length < 2) {
        throw new Error('Please enter a valid full name');
      }

      // Check if user is authenticated
      if (!user) {
        throw new Error('Please sign in to continue with payment');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication session expired. Please sign in again.');
      }

      toast({
        title: "Initiating Payment",
        description: "Setting up secure payment with PhonePe..."
      });

      const response = await PaymentService.initiatePhonePePayment(
        purchaseId!,
        totalAmount,
        {
          phone_number: bankDetails.accountNumber,
          name: bankDetails.accountHolderName
        }
      );

      if (response.success && response.paymentUrl) {
        toast({
          title: "Redirecting to PhonePe",
          description: "Please complete your payment on PhonePe. Do not close this window."
        });
        
        // Small delay to ensure toast is visible
        setTimeout(() => {
          window.location.href = response.paymentUrl!;
        }, 1000);
      } else {
        throw new Error(response.error || response.message || 'Failed to generate payment URL');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
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
          <p className="mt-4 text-muted-foreground">Loading payment details...</p>
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
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">PhonePe Payment</h1>
            <p className="text-muted-foreground mt-2">
              Complete your authorship purchase securely with PhonePe
            </p>
          </div>

          <div className="grid gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {purchaseData.upcoming_books?.cover_image_url && (
                    <img
                      src={purchaseData.upcoming_books.cover_image_url}
                      alt={purchaseData.upcoming_books.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{purchaseData.upcoming_books?.title}</h3>
                    <p className="text-sm text-muted-foreground">{purchaseData.upcoming_books?.genre}</p>
                    <Badge variant="secondary" className="mt-1">
                      Position {purchaseData.position_purchased}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Author Position {purchaseData.position_purchased}</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
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
                    <span>Position reserved for 15 minutes</span>
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
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone-number">Phone Number *</Label>
                      <Input
                        id="phone-number"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
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
                        value={bankDetails.accountHolderName}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
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
                        <Smartphone className="w-5 h-5 mr-2" />
                        Pay ₹{totalAmount.toLocaleString()} with PhonePe
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

          {/* Trust Indicators */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-8 h-8 text-green-500" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Smartphone className="w-8 h-8 text-blue-500" />
              <span className="text-sm font-medium">PhonePe Powered</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Instant Confirmation</span>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentGateway;