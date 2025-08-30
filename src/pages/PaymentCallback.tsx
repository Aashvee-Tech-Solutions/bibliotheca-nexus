import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Home, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PaymentService } from "@/lib/paymentService";

interface PaymentResult {
  status: 'success' | 'failed' | 'pending' | 'unknown';
  transactionId?: string;
  purchaseId?: string;
  amount?: number;
  message?: string;
}

const PaymentCallback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResult>({ status: 'unknown' });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const processPaymentCallback = async () => {
      try {
        // Get parameters from URL
        const transactionId = searchParams.get('transactionId');
        const status = searchParams.get('code') || searchParams.get('status');
        const purchaseId = searchParams.get('purchaseId');

        if (!transactionId) {
          throw new Error('Missing transaction ID');
        }

        // Check payment status with PhonePe
        const statusResponse = await PaymentService.checkPaymentStatus(transactionId);

        if (statusResponse.success) {
          const result: PaymentResult = {
            status: statusResponse.paymentStatus === 'completed' ? 'success' : 
                   statusResponse.paymentStatus === 'failed' ? 'failed' : 'pending',
            transactionId,
            purchaseId,
            message: statusResponse.message
          };
          
          setPaymentResult(result);

          // Show appropriate toast
          if (result.status === 'success') {
            toast({
              title: "Payment Successful!",
              description: "Your payment has been completed successfully.",
            });
          } else if (result.status === 'failed') {
            toast({
              title: "Payment Failed",
              description: result.message || "Your payment could not be processed.",
              variant: "destructive"
            });
          }
        } else {
          throw new Error(statusResponse.message || 'Payment status check failed');
        }

      } catch (error: any) {
        console.error('Payment callback error:', error);
        setPaymentResult({
          status: 'failed',
          message: error.message || 'Payment verification failed'
        });
        toast({
          title: "Payment Error",
          description: error.message || "Unable to verify payment status",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    processPaymentCallback();
  }, [user, navigate, searchParams, toast]);

  const getStatusIcon = () => {
    switch (paymentResult.status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      default:
        return <Clock className="w-16 h-16 text-gray-400" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentResult.status) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Payment Pending';
      default:
        return 'Processing Payment...';
    }
  };

  const getStatusMessage = () => {
    switch (paymentResult.status) {
      case 'success':
        return 'Your payment has been processed successfully. You will receive a confirmation email shortly.';
      case 'failed':
        return paymentResult.message || 'Your payment could not be processed. Please try again or contact support.';
      case 'pending':
        return 'Your payment is being processed. This may take a few minutes to complete.';
      default:
        return 'Please wait while we verify your payment status...';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment with PhonePe...
            </p>
          </div>
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
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground text-lg">
                {getStatusMessage()}
              </p>
              
              {paymentResult.transactionId && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{paymentResult.transactionId}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button onClick={() => navigate('/')} variant="outline" size="lg">
                  <Home className="w-5 h-5 mr-2" />
                  Go to Home
                </Button>
                
                <Button onClick={() => navigate('/books')} size="lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Books
                </Button>
              </div>

              {paymentResult.status === 'failed' && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                    Need Help?
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    If your payment was deducted but shows as failed, please contact our support team with your transaction ID.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/contact')}>
                    Contact Support
                  </Button>
                </div>
              )}

              {paymentResult.status === 'success' && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                    What's Next?
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 text-left space-y-1">
                    <li>• You'll receive a confirmation email within 5-10 minutes</li>
                    <li>• Your order will be processed within 1-2 business days</li>
                    <li>• Shipping typically takes 5-7 business days</li>
                    <li>• You can track your order status in your dashboard</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentCallback;
