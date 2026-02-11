import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  Check,
  X,
  Loader2,
  Crown,
  Sparkles
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import StripeCheckoutForm from '../payment/StripeCheckoutForm';

// Initialize Stripe
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripePublicKey) {
  console.error('VITE_STRIPE_PUBLISHABLE_KEY is not defined in your .env file');
}
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : Promise.resolve(null);

/**
 * Premium Pricing Page Component
 * Modern pricing UI with Stripe payment integration
 * 
 * Features:
 * - Fetch pricing plans from backend
 * - Start payment process
 * - Handle payment iframe
 * - Verify payment status
 */

export default function PremiumPricingPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // State management
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [showPaymentNotReadyModal, setShowPaymentNotReadyModal] = useState(false);

  // Fetch pricing plans on component mount
  useEffect(() => {
    fetchPricingPlans();
  }, []);

  /**
   * Fetch available pricing plans from backend
   */
  const fetchPricingPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/payments/plans`);
      const data = await response.json();

      if (data.success) {
        setPlans(data.data);
      } else {
        toast.error('Failed to load pricing plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle plan selection and start payment
   */
  const handleSelectPlan = async (plan) => {
    // Check if user is logged in
    if (!user || !token) {
      toast.info('Please login to continue');
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    // Check if user already has premium
    if (user.isPremium && user.premiumPlan) {
      toast.info('You already have an active premium subscription!');
      return;
    }

    setSelectedPlan(plan);
    await startPayment(plan);
  };

  /**
   * Start payment process
   * Calls backend API to initiate Stripe payment
   */
  const startPayment = async (plan) => {
    try {
      setProcessingPayment(true);
      console.log('Starting payment for plan:', plan.name);

      const response = await fetch(`${API_BASE_URL}/payments/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planType: plan.type,
          planName: plan.name,
          amount: plan.price,
          currency: plan.currency || 'USD',
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Payment initiated:', data.data);

        // Store payment ID for verification later
        setPaymentId(data.data.paymentId);

        // Store client secret for Stripe Elements
        setClientSecret(data.data.clientSecret);
        setShowCheckout(true);

        toast.success('Payment initiated! Please complete the checkout.');
      } else {
        toast.error(data.message || 'Failed to start payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to start payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  /**
   * Close checkout modal
   */
  const closeCheckout = () => {
    setShowCheckout(false);
    setClientSecret('');
    setSelectedPlan(null);

    // Verify payment status after closing
    if (paymentId) {
      setTimeout(() => {
        verifyPayment(paymentId);
      }, 2000);
    }
  };

  /**
   * Verify payment status manually
   */
  const verifyPayment = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/verify/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data.isPremium) {
        toast.success('🎉 Payment successful! Premium activated!');
        // Refresh page or redirect to dashboard
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (data.data.status === 'pending') {
        toast.info('Payment is still processing...');
      } else {
        toast.warning('Payment verification pending. Please check your email.');
      }
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E14] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E14] py-20 px-4">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#06b5cc]/10 border border-[#06b5cc]/30 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm text-[#06b5cc] font-medium">Premium Plans</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Choose Your Premium Plan
        </h1>
        <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
          Unlock unlimited access to AI tutoring, homework analysis, and premium features
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-[#111113] border-2 rounded-2xl p-8 ${!!plan.popular
              ? 'border-[#06b5cc] shadow-2xl shadow-[#06b5cc]/20'
              : 'border-white/10 hover:border-white/20 shadow-xl shadow-black/50'
              }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="px-4 py-1 bg-gradient-to-r from-[#11282b] to-[#06b5cc] text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              </div>
            )}

            {/* Best Value Badge */}
            {plan.bestValue && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 bg-gradient-to-r from-[#F7C94C] to-[#F59E0B] text-[#0A0E14] text-sm font-bold rounded-full">
                  Best Value
                </div>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-xl text-[#94A3B8]">{plan.currency}</span>
              </div>
              <p className="text-sm text-[#94A3B8]">{plan.duration}</p>

              {/* Savings Badge */}
              {plan.savings && (
                <div className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                  {plan.savings}
                </div>
              )}
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-8">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#06b5cc]/20 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-[#E2E8F0]">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={processingPayment && selectedPlan?.id === plan.id}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${!!plan.popular
                ? 'bg-gradient-to-r from-[#11282b] to-[#06b5cc] text-white hover:shadow-lg hover:shadow-[#06b5cc]/30'
                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {processingPayment && selectedPlan?.id === plan.id ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Get {plan.name}
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Stripe Checkout Modal */}
      {showCheckout && clientSecret && createPortal(
        <div className="checkout-portal-backdrop">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-[#0B0B0D] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative max-h-[calc(100vh-120px)] flex flex-col my-auto md:my-0"
          >
            {/* Background Effects (Reduced Opacity) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#06b5cc]/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F7C94C]/5 rounded-full blur-[60px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 relative z-10 bg-[#0B0B0D]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#06b5cc]/10 flex items-center justify-center border border-[#06b5cc]/20">
                    <Crown className="w-5 h-5 text-[#06b5cc]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{selectedPlan?.name}</h3>
                  </div>
                  <div className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06b5cc]/20 border border-[#06b5cc]/40 text-[#06b5cc] text-[10px] font-black tracking-widest uppercase shadow-[0_0_20px_rgba(6,181,204,0.3)] animate-pulse-subtle">
                    <Crown className="w-4 h-4" />
                    Premium Access
                  </div>
                </div>
              </div>
              <button
                onClick={closeCheckout}
                className="p-2 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-white/20 group"
              >
                <X className="w-5 h-5 text-[#94A3B8] group-hover:rotate-90 transition-transform duration-300 group-hover:text-white" />
              </button>
            </div>

            {/* Stripe Elements */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] sm:max-h-[60vh] custom-scrollbar relative z-10">
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    labels: 'floating',
                    variables: {
                      colorPrimary: '#06b5cc',
                      colorBackground: '#0A0A0B',
                      colorText: '#ffffff',
                      colorDanger: '#EF4444',
                      fontFamily: 'Outfit, system-ui, sans-serif',
                      fontSizeBase: '16px',
                      spacingUnit: '4px',
                      borderRadius: '12px',
                    },
                  }
                }}
              >
                <StripeCheckoutForm
                  amount={selectedPlan?.price}
                  currency={selectedPlan?.currency || 'USD'}
                  onCancel={closeCheckout}
                />
              </Elements>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Money Back Guarantee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <p className="text-[#94A3B8] text-sm">
          🔒 Secure payment powered by Stripe • 💳 All payment methods accepted •
          ✨ Instant activation after payment
        </p>
      </motion.div>
    </div>
  );
}

