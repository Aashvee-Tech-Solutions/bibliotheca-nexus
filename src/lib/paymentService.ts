import { supabase } from '@/integrations/supabase/client';

export interface PaymentDetails {
  phone_number: string;
  name: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  status?: string;
  message: string;
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionId: string;
  phonepeResponse?: any;
  message: string;
}

export class PaymentService {
  /**
   * Initiate a PhonePe payment
   */
  static async initiatePhonePePayment(
    purchaseId: string,
    amount: number,
    userDetails: PaymentDetails
  ): Promise<PaymentResponse> {
    try {
      // Validate inputs
      if (!purchaseId || !amount || !userDetails.phone_number || !userDetails.name) {
        throw new Error('Missing required payment details');
      }

      // Validate phone number
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(userDetails.phone_number)) {
        throw new Error('Invalid phone number format');
      }

      // Validate amount
      if (amount <= 0 || amount > 500000) {
        throw new Error('Invalid payment amount');
      }

      const response = await supabase.functions.invoke('phonepe-payment', {
        body: {
          purchase_id: purchaseId,
          amount: amount,
          user_details: {
            phone_number: userDetails.phone_number,
            name: userDetails.name.trim()
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Payment service error');
      }

      return response.data as PaymentResponse;
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        message: 'Payment initiation failed',
        error: error.message
      };
    }
  }

  /**
   * Check payment status
   */
  static async checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      const response = await supabase.functions.invoke('phonepe-status', {
        body: { transaction_id: transactionId }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Status check failed');
      }

      return response.data as PaymentStatusResponse;
    } catch (error: any) {
      console.error('Payment status check error:', error);
      return {
        success: false,
        paymentStatus: 'failed',
        transactionId,
        message: 'Status check failed'
      };
    }
  }

  /**
   * Process refund (admin only)
   */
  static async processRefund(
    purchaseId: string,
    refundAmount: number,
    reason: string
  ): Promise<PaymentResponse> {
    try {
      if (!purchaseId || !refundAmount || !reason) {
        throw new Error('Missing required refund details');
      }

      if (refundAmount <= 0) {
        throw new Error('Invalid refund amount');
      }

      const response = await supabase.functions.invoke('phonepe-refund', {
        body: {
          purchase_id: purchaseId,
          refund_amount: refundAmount,
          reason: reason
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Refund service error');
      }

      return response.data as PaymentResponse;
    } catch (error: any) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        message: 'Refund processing failed',
        error: error.message
      };
    }
  }

  /**
   * Process Cashfree payment with bank verification
   */
  static async initiateCashfreePayment(
    purchaseId: string,
    amount: number,
    bankDetails: {
      account_number: string;
      ifsc_code: string;
      bank_name: string;
      account_holder_name: string;
    }
  ): Promise<PaymentResponse> {
    try {
      // Validate inputs
      if (!purchaseId || !amount || !bankDetails.account_number || !bankDetails.ifsc_code) {
        throw new Error('Missing required payment details');
      }

      // Validate amount
      if (amount <= 0 || amount > 500000) {
        throw new Error('Invalid payment amount');
      }

      const response = await supabase.functions.invoke('payment-processor', {
        body: {
          purchase_id: purchaseId,
          amount: amount,
          bank_details: bankDetails
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Payment service error');
      }

      return response.data as PaymentResponse;
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        message: 'Payment initiation failed',
        error: error.message
      };
    }
  }

  /**
   * Validate PhonePe webhook signature (utility for debugging)
   */
  static validateWebhookSignature(payload: string, signature: string, saltKey: string): boolean {
    try {
      // This is a client-side utility for debugging - actual validation happens on server
      const expectedSignature = btoa(payload + saltKey);
      return signature === expectedSignature;
    } catch (error) {
      console.error('Signature validation error:', error);
      return false;
    }
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phone: string): string {
    if (phone.length === 10) {
      return `+91 ${phone.substring(0, 5)} ${phone.substring(5)}`;
    }
    return phone;
  }
}
