import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  Check,
  CheckCircle,
  Crown,
  Loader2,
  X,
  CreditCard,
  AlertCircle,
  Clock,
  Sparkles,
  Shield
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { API_BASE_URL } from '../../config/api';
import StripeCheckoutForm from '../payment/StripeCheckoutForm';

// Initialize Stripe
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripePublicKey) {
  console.error('VITE_STRIPE_PUBLISHABLE_KEY is not defined in your .env file');
}
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : Promise.resolve(null);

export default function PricingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { settings } = useSettings();

  // State for payment processing
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [showPaymentNotReadyModal, setShowPaymentNotReadyModal] = useState(false);

  // State for pricing plans
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Fetch pricing plans from API
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await fetch(`${API_BASE_URL}/payments/plans`);
        const data = await response.json();

        if (data.success) {
          setPricingPlans(data.data || []);
        } else {
          toast.error('Failed to load pricing plans');
        }
      } catch (error) {
        toast.error('Failed to load pricing plans');
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPricingPlans();
  }, []);

  useEffect(() => {
    const targetSection = location.state?.targetSection;
    const hashSection = location.hash ? location.hash.replace('#', '') : null;
    const sectionToScroll = targetSection || hashSection;

    if (sectionToScroll) {
      requestAnimationFrame(() => {
        const element = document.getElementById(sectionToScroll);
        if (element) {
          const offset = 96;
          const y = element.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({
            top: y >= 0 ? y : 0,
            behavior: 'smooth',
          });
        }
      });

      if (targetSection) {
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location, navigate]);

  // Lock body scroll when checkout is open
  useEffect(() => {
    if (showCheckout) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCheckout]);

  // Handle payment
  const handlePayment = async (planType, planName, amount, currency = 'USD') => {
    // Check if user is logged in
    if (!user || !token) {
      toast.info('Please login to subscribe');
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    // Check if already premium
    if (user.isPremium && user.premiumPlan) {
      toast.info('You already have an active premium subscription!');
      return;
    }

    setSelectedPlan({ planType, planName, amount, currency });
    setProcessingPayment(true);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planType,
          planName,
          amount,
          currency: currency || 'USD',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentId(data.data.paymentId);
        setClientSecret(data.data.clientSecret);
        setShowCheckout(true);
        toast.success('Payment initialized! Please complete the checkout.');
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

  // Close checkout
  const closeCheckout = () => {
    setShowCheckout(false);
    setClientSecret('');
    setSelectedPlan(null);

    // Verify payment after closing (in case they finished but return_url didn't trigger yet)
    if (paymentId) {
      setTimeout(() => verifyPayment(paymentId), 2000);
    }
  };

  // Verify payment
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
        setTimeout(() => window.location.reload(), 1500);
      } else if (data.data.status === 'pending') {
        toast.info('Payment is still processing...');
      }
    } catch (error) {
      // Payment verification error - handled silently
    }
  };

  // Helper function to get duration text
  const getDurationText = (duration) => {
    if (duration === 30) return '/month';
    if (duration === 365) return '/year';
    if (duration === 730) return '/2 years';
    return `/${duration} days`;
  };

  // Helper function to format price
  const formatPrice = (price, currency = 'USD') => {
    return `${currency} ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loadingPlans) {
    return (
      <div className="min-h-screen py-10 md:py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen py-10 md:py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center mb-16">
        <div className="inline-flex h-8 items-center gap-3 px-6 py-2.5 bg-[#06b5cc]/10 border border-[#06b5cc]/20 rounded-full mb-8 mx-auto mt-4 hover:bg-[#06b5cc]/15 transition-colors duration-300">
          <Sparkles className="w-6 h-5 text-[#06b5cc]" />
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#06b5cc]">Premium Experience</span>
        </div>
        {settings.pricingPage?.title ? (
          <h1 className="mb-6 text-gradient-cyan">{settings.pricingPage.title}</h1>
        ) : (
          <div className="mb-6 bg-gradient-to-br from-[#111113] to-[#111113]/50 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-[#94A3B8] text-lg">Pricing page title is not configured. Please add this content from the admin dashboard.</p>
          </div>
        )}
        {settings.pricingPage?.description ? (
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
            {settings.pricingPage.description}
          </p>
        ) : (
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto italic">
            Pricing page description is not configured. Please add this content from the admin dashboard.
          </p>
        )}
      </motion.div>

      <div id="pricing-plans" className={`grid grid-cols-1 ${pricingPlans.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8 mb-16 scroll-mt-24 lg:scroll-mt-32`}>
        {/* Free Plan */}
        <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.1
        }} className="bg-gradient-to-br from-[#111113] to-[#111113]/50 border border-white/10 rounded-2xl p-6 md:p-8 hover:border-[#06b5cc]/30 transition-all duration-300 shadow-lg hover:shadow-[#06b5cc]/5">
          <h3 className="mb-2 text-[#06b5cc] font-bold">Free</h3>
          <div className="mb-6">
            <span className="text-4xl text-white font-bold">{settings.branding?.currency || 'USD'} 0</span>
            <span className="text-[#94A3B8]">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            {settings.pricingPage?.freePlanFeatures && settings.pricingPage.freePlanFeatures.length > 0 ? (
              settings.pricingPage.freePlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <Check className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-[#94A3B8]">{feature}</span>
                </li>
              ))
            ) : (
              <li className="text-[#94A3B8] text-sm italic">
                Free plan features are not configured. Please add features from the admin dashboard.
              </li>
            )}
          </ul>
          <button className="w-full py-3 bg-[#06b5cc]/10 border border-[#06b5cc]/30 rounded-xl text-[#EADADA] font-semibold transition-all duration-300 hover:bg-[#06b5cc]/20 hover:scale-105 active:scale-95">
            Current Plan
          </button>
        </motion.div>

        {/* Dynamic Pricing Plans from API */}
        {pricingPlans.map((plan, index) => {
          const isPopular = !!plan.popular;
          const isYearly = plan.duration === 365 || plan.type === 'yearly';

          return (
            <motion.div
              key={plan._id || plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + (index * 0.1) }}
              className={`relative ${isPopular
                ? 'bg-gradient-to-br from-[#06b5cc]/20 to-[#F7C94C]/20 border-2 border-[#F7C94C] rounded-2xl p-6 md:p-8 lg:scale-105 shadow-xl shadow-[#06b5cc]/10'
                : 'bg-gradient-to-br from-[#111113] to-[#111113]/50 border border-white/10 rounded-2xl p-6 md:p-8'
                }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#F7C94C] to-[#06b5cc] rounded-full text-sm flex items-center">
                  <Crown className="w-4 h-4 mr-1" />
                  Most Popular
                </div>
              )}

              {isYearly && !isPopular && (
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="mb-0">{plan.name}</h3>
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-xs text-green-400">
                    Save 50%
                  </span>
                </div>
              )}

              {!isYearly && <h3 className="mb-2">{plan.name}</h3>}

              {plan.description && (
                <p className={`text-sm mb-4 ${isPopular ? 'text-white/80' : 'text-[#94A3B8]'}`}>
                  {plan.description}
                </p>
              )}

              <div className="mb-6">
                <span className="text-4xl">{formatPrice(plan.price, plan.currency || settings.branding?.currency || 'USD')}</span>
                <span className="text-[#94A3B8]">{getDurationText(plan.duration)}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {(plan.features || []).map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start text-sm">
                    <Check className={`w-5 h-5 ${isPopular ? 'text-[#F7C94C]' : 'text-[#EADADA]'} mr-2 flex-shrink-0 mt-0.5`} />
                    <span className={isPopular ? 'text-white' : 'text-[#94A3B8]'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (user?.isPremium && user?.premiumPlan === plan.type) return;
                  handlePayment(plan.type, plan.name, plan.price, plan.currency || settings.branding?.currency);
                }}
                disabled={(processingPayment && selectedPlan?.planType === plan.type) || (user?.isPremium && user?.premiumPlan === plan.type)}
                className={`w-full py-3 transition-all  rounded-xl duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl text-white ${user?.isPremium && user?.premiumPlan === plan.type
                  ? 'bg-white/10 border border-white/10 cursor-default'
                  : 'btn-orange'
                  }`}
              >
                {processingPayment && selectedPlan?.planType === plan.type ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : user?.isPremium && user?.premiumPlan === plan.type ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Current Plan
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Trust Section */}
      {settings.pricingPage?.trustStats && settings.pricingPage.trustStats.length > 0 && (
        <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }} className="bg-gradient-to-br from-[#111113] to-[#111113]/50 border border-white/10 rounded-2xl p-6 md:p-8 text-center">
          <h2 className="mb-6">Trusted by Thousands of Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {settings.pricingPage.trustStats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl mb-2 text-[#06b5cc]">{stat.value}</div>
                <div className="text-[#94A3B8]">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* FAQ */}
      {settings.pricingPage?.faqs && settings.pricingPage.faqs.length > 0 && (
        <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.5
        }} className="mt-16">
          <h2 className="text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.pricingPage.faqs.map((faq, index) => (
              <div key={index} className="bg-gradient-to-br from-[#111113] to-[#111113]/50 border border-white/10 rounded-2xl p-6">
                <h3 className="mb-3 text-[#EADADA]">{faq.question}</h3>
                <p className="text-[#94A3B8] text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>

    {/* Stripe Checkout Modal - Moved to Portal */}
    {showCheckout && clientSecret && createPortal(
      <div className="checkout-portal-backdrop">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          style={{ backgroundColor: '#000000' }}
          className="bg-black border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative max-h-[calc(100vh-120px)] flex flex-col my-auto md:my-0"
        >
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#06b5cc]/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F7C94C]/5 rounded-full blur-[60px] pointer-events-none" />

          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/5 relative z-10 bg-black">
            <div className="flex items-center gap-4">
              <div className="flex items-center  gap-2">
                <Crown className="w-6 h-6 text-[#06b5cc] flex-shrink-0" />
                <h3 className="text-sm font-bold text-white leading-tight">Subscribe to {selectedPlan?.planName}</h3>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06b5cc]/20 border border-[#06b5cc]/40 text-[#06b5cc] text-[10px] font-black tracking-widest uppercase shadow-[0_0_20px_rgba(6,181,204,0.3)] animate-pulse-subtle">
                <Crown className="w-4 h-4" />
                Premium Access
              </div>
            </div>
            <button
              onClick={closeCheckout}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-[#94A3B8] hover:text-white border border-white/5 hover:border-white/20 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>



          {/* Stripe Elements */}
          <div className="flex-1 p-6 pt-10 overflow-y-auto custom-scrollbar relative z-10">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  labels: 'floating',
                  variables: {
                    colorPrimary: '#06b5cc',
                    colorBackground: '#0a0a0a',
                    colorText: '#ffffff',
                    colorDanger: '#EF4444',
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    spacingUnit: '2px',
                    borderRadius: '8px',
                    gridRowGap: '12px',
                    gridColumnGap: '16px',
                  },
                  rules: {
                    '.Tab': {
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      columnGap: '8px',
                      padding: '8px 12px',
                      height: 'auto',
                    },
                    '.TabIcon': {
                      marginBottom: '0px',
                      width: '18px',
                      height: '18px',
                    },
                    '.TabLabel': {
                      fontSize: '14px',
                      fontWeight: '500',
                      lineHeight: '1',
                      marginTop: '0px',
                    },
                    '.Input': {
                      padding: '10px 12px',
                    },
                    '.Label': {
                      marginBottom: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#94A3B8',
                    }
                  }
                }
              }}
            >
              <StripeCheckoutForm
                amount={selectedPlan?.amount}
                currency={selectedPlan?.currency || 'USD'}
                paymentId={paymentId}
                onCancel={closeCheckout}
              />
            </Elements>
          </div>
        </motion.div>
      </div>,
      document.body
    )}

    {/* Payment Setup Modal */}
    {showPaymentNotReadyModal && (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
        }}
        onClick={() => setShowPaymentNotReadyModal(false)}
      >
        <div
          style={{
            backgroundColor: '#111113',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(122, 20, 25, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#FFFFFF' }}>Payment Setup</h2>
            </div>
            <button
              onClick={() => setShowPaymentNotReadyModal(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* Warning Section */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#0A0E14',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#F7C94C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertCircle style={{ width: '24px', height: '24px', color: '#000000' }} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>
                Payment Gateway Under Setup
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#94A3B8', lineHeight: '1.5' }}>
                We're currently setting up our payment gateway. The Stripe payment integration is being configured and will be available soon.
              </p>
            </div>
          </div>

          {/* Plan Details */}
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#0A0E14',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Selected Plan</span>
              <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: '500' }}>
                {selectedPlan?.planName || 'Premium Plan'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Price</span>
              <span style={{ fontSize: '16px', color: '#F7C94C', fontWeight: '600' }}>
                {settings.branding?.currency || 'USD'} {selectedPlan?.amount?.toLocaleString() || '249.99'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Duration</span>
              <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: '500' }}>
                {selectedPlan?.planType === 'yearly' ? '12 months' : '1 month'}
              </span>
            </div>
          </div>

          {/* What's Next Section */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#0A0E14',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(122, 20, 25, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Clock style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>
                  What's Next?
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#94A3B8', lineHeight: '1.5' }}>
                  Once the payment gateway is configured, you'll be able to complete your subscription securely through Stripe. We'll notify you as soon as it's ready!
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowPaymentNotReadyModal(false)}
            className="w-full btn-orange"
          >
            Got it, Thanks!
          </button>
        </div>
      </div>
    )}
  </div>;
}