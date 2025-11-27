import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Crown, Loader2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { toast } from 'react-toastify';
export default function PricingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // State for payment processing
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [paymentId, setPaymentId] = useState(null);

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

  // Handle payment
  const handlePayment = async (planType, planName, amount) => {
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

    setSelectedPlan({ planType, planName, amount });
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
          currency: 'EGP',
          phone: user.phone || '+201000000000',
          city: 'Cairo',
          country: 'Egypt',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Check if test mode
        if (data.data.isTestMode) {
          toast.warning('⚠️ TEST MODE: Paymob not configured!', {
            autoClose: 5000,
          });
          toast.info('Please configure Paymob credentials in backend .env file', {
            autoClose: 7000,
          });
          console.log('TEST MODE DATA:', data.data);
        } else {
          setPaymentId(data.data.paymentId);
          setIframeUrl(data.data.iframeUrl);
          setShowIframe(true);
          toast.success('Payment initiated! Please complete the payment.');
        }
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

  // Close iframe
  const closeIframe = () => {
    setShowIframe(false);
    setIframeUrl('');
    setSelectedPlan(null);

    // Verify payment after closing
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
      console.error('Verification error:', error);
    }
  };

  const features = ['Access to all lesson notes', 'Unlimited practice questions', 'Detailed step-by-step solutions', 'AI Tutor for instant help', 'Progress tracking', 'Downloadable resources', 'Priority support', 'Early access to new content'];
  return <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center mb-16">
          <h1 className="mb-6">Unlock Your Full Potential</h1>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
            Get unlimited access to all premium features and accelerate your mathematics journey
          </p>
        </motion.div>

        <div id="pricing-plans" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 scroll-mt-24 lg:scroll-mt-32">
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
        }} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
            <h3 className="mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl">EGP 0</span>
              <span className="text-[#94A3B8]">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-sm">
                <Check className="w-5 h-5 text-[#2F6FED] mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-[#94A3B8]">6 free questions per lesson</span>
              </li>
              <li className="flex items-start text-sm">
                <Check className="w-5 h-5 text-[#2F6FED] mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-[#94A3B8]">Basic progress tracking</span>
              </li>
              <li className="flex items-start text-sm">
                <Check className="w-5 h-5 text-[#2F6FED] mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-[#94A3B8]">Community support</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[#94A3B8] cursor-not-allowed">
              Current Plan
            </button>
          </motion.div>

          {/* Premium Plan - Featured */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="relative bg-gradient-to-br from-[#2F6FED]/20 to-[#F7C94C]/20 border-2 border-[#F7C94C] rounded-2xl p-8 lg:scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#F7C94C] to-[#2F6FED] rounded-full text-sm flex items-center">
              <Crown className="w-4 h-4 mr-1" />
              Most Popular
            </div>
            
            <h3 className="mb-2">Premium</h3>
            <div className="mb-6">
              <span className="text-4xl">EGP 249.99</span>
              <span className="text-[#94A3B8]">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => <li key={index} className="flex items-start text-sm">
                  <Check className="w-5 h-5 text-[#F7C94C] mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>)}
            </ul>
            <button
              onClick={() => handlePayment('monthly', 'Monthly Premium', 249.99)}
              disabled={processingPayment && selectedPlan?.planType === 'monthly'}
              style={{
                borderRadius: '9999px',
                padding: '16px 32px',
                background: 'linear-gradient(to right, #F7C94C, #2F6FED)',
                fontWeight: '600',
                boxShadow: '0 10px 30px rgba(247, 201, 76, 0.4)'
              }}
              className="w-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl"
            >
              {processingPayment && selectedPlan?.planType === 'monthly' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Subscribe with Paymob'
              )}
            </button>
          </motion.div>

          {/* Annual Plan */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
            <div className="mb-2 flex items-center justify-between">
              <h3>Annual</h3>
              <span className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-xs text-green-400">
                Save 50%
              </span>
            </div>
            <div className="mb-6">
              <span className="text-4xl">EGP 1,499.99</span>
              <span className="text-[#94A3B8]">/year</span>
            </div>
            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => <li key={index} className="flex items-start text-sm">
                  <Check className="w-5 h-5 text-[#A9C7FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-[#94A3B8]">{feature}</span>
                </li>)}
              <li className="flex items-start text-sm">
                <Check className="w-5 h-5 text-[#F7C94C] mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-[#F7C94C]">2 months free!</span>
              </li>
            </ul>
            <button
              onClick={() => handlePayment('yearly', 'Annual Premium', 1499.99)}
              disabled={processingPayment && selectedPlan?.planType === 'yearly'}
              style={{
                borderRadius: '9999px',
                padding: '16px 32px',
                backgroundColor: '#2F6FED',
                fontWeight: '600',
                boxShadow: '0 10px 30px rgba(47, 111, 237, 0.5)',
                border: '1px solid #2F6FED'
              }}
              className="w-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl"
            >
              {processingPayment && selectedPlan?.planType === 'yearly' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Subscribe with Paymob'
              )}
            </button>
          </motion.div>
        </div>

        {/* Trust Section */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.4
      }} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8 text-center">
          <h2 className="mb-6">Trusted by Thousands of Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-2 text-[#2F6FED]">98%</div>
              <div className="text-[#94A3B8]">Student Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl mb-2 text-[#A9C7FF]">50k+</div>
              <div className="text-[#94A3B8]">Questions Solved</div>
            </div>
            <div>
              <div className="text-4xl mb-2 text-[#F7C94C]">A*</div>
              <div className="text-[#94A3B8]">Average Grade</div>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
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
            {[{
            q: 'Can I cancel anytime?',
            a: 'Yes! You can cancel your subscription at any time with no cancellation fees.'
          }, {
            q: 'Do you offer refunds?',
            a: 'We offer a 14-day money-back guarantee if you\'re not satisfied with the premium features.'
          }, {
            q: 'What payment methods do you accept?',
            a: 'We accept all major credit cards, debit cards, and local payment methods through Paymob.'
          }, {
            q: 'Is there a student discount?',
            a: 'Yes! Contact our support team with your student ID for a special discount code.'
          }].map((faq, index) => <div key={index} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6">
                <h3 className="mb-3 text-[#A9C7FF]">{faq.q}</h3>
                <p className="text-[#94A3B8] text-sm">{faq.a}</p>
              </div>)}
          </div>
        </motion.div>
      </div>

      {/* Payment iframe Modal */}
      {showIframe && iframeUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1D34] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Complete Payment</h3>
              <button
                onClick={closeIframe}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* iframe */}
            <div className="relative h-[calc(90vh-80px)]">
              <iframe
                src={iframeUrl}
                className="w-full h-full"
                title="Payment Gateway"
                frameBorder="0"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>;
}