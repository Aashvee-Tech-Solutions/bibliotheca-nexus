import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, ArrowRight, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentService } from "@/lib/paymentService";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);

  const txnId = searchParams.get('txnId');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!txnId) {
      setPaymentStatus('failed');
      return;
    }

    checkPaymentStatus();
  }, [user, txnId]);

  const checkPaymentStatus = async () => {
    try {
      // Check payment status using our payment service
      const result = await PaymentService.checkPaymentStatus(txnId!);
      
      if (result.success) {
        setPaymentStatus(result.paymentStatus);
        setTransactionDetails(result.phonepeResponse);
        
        // Fetch purchase details
        const { data: purchase, error: purchaseError } = await supabase
          .from('authorship_purchases')
          .select(`
            *,
            upcoming_books (
              title,
              genre,
              cover_image_url
            )
          `)
          .eq('payment_id', txnId)
          .single();

        if (!purchaseError && purchase) {
          setPurchaseDetails(purchase);
        }

        // Show appropriate toast message
        if (result.paymentStatus === 'completed') {
          toast({
            title: "Payment Successful!",
            description: "Your authorship position has been secured.",
          });
        } else if (result.paymentStatus === 'pending') {
          toast({
            title: "Payment Pending",
            description: "Your payment is being processed. Please wait.",
          });
        } else {
          toast({
            title: "Payment Failed",
            description: "There was an issue with your payment.",
            variant: "destructive"
          });
        }
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Error",
          description: result.message || "Failed to check payment status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('failed');
      toast({
        title: "Error",
        description: "Failed to verify payment status",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
      case 'completed':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      default:
        return <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'success':
      case 'completed':
        return "Payment Successful!";
      case 'failed':
        return "Payment Failed";
      case 'pending':
        return "Payment Pending";
      default:
        return "Verifying Payment...";
    }
  };

  const getStatusDescription = () => {
    switch (paymentStatus) {
      case 'success':
      case 'completed':
        return "Congratulations! Your authorship position has been successfully secured.";
      case 'failed':
        return "Unfortunately, your payment could not be processed. Please try again.";
      case 'pending':
        return "Your payment is being processed. This may take a few minutes.";
      default:
        return "Please wait while we verify your payment status...";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
              <CardDescription className="text-base">
                {getStatusDescription()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Transaction Details */}
              {txnId && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Transaction Details</h3>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Transaction ID:</strong> {txnId}</p>
                    {transactionDetails?.data?.transactionId && (
                      <p><strong>PhonePe Transaction ID:</strong> {transactionDetails.data.transactionId}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Purchase Details */}
              {purchaseDetails && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Purchase Details</h3>
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    {purchaseDetails.upcoming_books?.cover_image_url && (
                      <img
                        src={purchaseDetails.upcoming_books.cover_image_url}
                        alt={purchaseDetails.upcoming_books.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{purchaseDetails.upcoming_books?.title}</h4>
                      <p className="text-sm text-muted-foreground">{purchaseDetails.upcoming_books?.genre}</p>
                      <p className="text-sm"><strong>Position:</strong> {purchaseDetails.position_purchased}</p>
                      <p className="text-sm"><strong>Amount:</strong> ₹{purchaseDetails.total_amount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                {paymentStatus === 'completed' && (
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                )}
                
                {paymentStatus === 'failed' && (
                  <Button 
                    onClick={() => navigate('/upcoming-books')}
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                )}
                
                {paymentStatus === 'pending' && (
                  <Button 
                    onClick={checkPaymentStatus}
                    variant="outline"
                    className="flex-1"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Check Status Again
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Support Information */}
              <div className="text-center text-sm text-muted-foreground pt-6 border-t">
                <p>Having issues with your payment?</p>
                <Button
                  variant="link"
                  onClick={() => navigate('/contact')}
                  className="text-primary hover:underline p-0 h-auto"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
