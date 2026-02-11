import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Crown, LogOut, Loader2, Calendar, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, logout, isAuthenticated, token, refreshUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!authLoading && user) {
      setProfileLoading(false);
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Handle payment verification
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get('payment');
    const paymentId = queryParams.get('paymentId');

    if (paymentStatus === 'success' && paymentId && !isVerifying) {
      verifyUserPayment(paymentId);
    }
  }, [location]);

  const verifyUserPayment = async (paymentId) => {
    setIsVerifying(true);
    const id = toast.loading('Verifying your premium activation...');

    try {
      // Polling for up to 3 times if needed, but usually 1 is enough with fresh token
      let attempts = 0;
      const maxAttempts = 3;
      let verified = false;

      while (attempts < maxAttempts && !verified) {
        const response = await fetch(`${API_BASE_URL}/payments/verify/${paymentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success && data.data.isPremium) {
          verified = true;
          await refreshUser();
          toast.update(id, {
            render: '🎉 Premium activated! Welcome aboard.',
            type: 'success',
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
          }
        }
      }

      if (!verified) {
        toast.update(id, {
          render: 'Payment is still processing. Please wait a moment.',
          type: 'info',
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.update(id, {
        render: 'Verification failed. Please refresh or contact support.',
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsVerifying(false);
      // Clean up URL
      navigate('/profile', { replace: true });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading profile...</p>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#94A3B8] mb-4">Please login to view your profile</p>
          <Link
            to="/login"
            className="px-6 py-3 btn-orange rounded-xl transition-colors inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen py-20 px-4 relative overflow-hidden">
      {/* Background Elements */}


      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#06b5cc] to-[#F7C94C] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full py-4 px-4  bg-[#111113] border-4 border-[#1A1A1D] flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full " />
                ) : (
                  <User className="w-12 h-12 md:w-16 md:h-16 text-white/30" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-[#111113] rounded-xl flex items-center justify-center border-2 border-[#1A1A1D] shadow-lg">
                <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full ${user.isPremium ? 'bg-[#F7C94C]' : 'bg-[#06b5cc]'} animate-pulse`} />
              </div>
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  {user.name || 'Student'}
                </span>
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 text-[#94A3B8]">
                <div className="flex items-center gap-2 text-[10px] md:text-xs bg-white/5 px-3 md:px-4 py-2 md:py-2.5 rounded-full border border-white/5 group hover:border-[#06b5cc]/30 transition-colors max-w-[150px] sm:max-w-none">
                  <Mail className="w-3.5 h-3.5 text-[#06b5cc] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-white/80 truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] md:text-xs bg-white/5 px-3 md:px-4 py-2 md:py-2.5 rounded-full border border-white/5 group hover:border-[#F7C94C]/30 transition-colors">
                  <Shield className="w-3.5 h-3.5 text-[#F7C94C] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-white/80">{user.isPremium ? 'Premium' : (user.role === 'admin' ? 'Admin' : 'Basic')}</span>
                </div>
                {user.isPremium && (
                  <div className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-[#F7C94C]/10 border border-[#F7C94C]/30 text-[#F7C94C] text-[10px] md:text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(247,201,76,0.1)] whitespace-nowrap animate-shine-slow">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Pro</span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:ml-auto">
              <div className="text-right hidden md:block">
                <p className="text-sm text-[#94A3B8] mb-1">Member Since</p>
                <p className="text-white font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="md:col-span-2 space-y-6">

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-[#1A1A1D]/60 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group"
                >

                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-[#06b5cc] transition-colors">
                    {user.stats?.lessonsCompleted || 0}
                  </div>
                  <div className="text-sm text-[#94A3B8]">Lessons Completed</div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-[#1A1A1D]/60 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group"
                >

                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-[#F7C94C] transition-colors">
                    {user.stats?.questionsSolved || 0}
                  </div>
                  <div className="text-sm text-[#94A3B8]">Questions Solved</div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-[#1A1A1D]/60 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group"
                >

                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                    {user.stats?.sectionsMastered || 0}
                  </div>
                  <div className="text-sm text-[#94A3B8]">Sections Mastered</div>
                </motion.div>
              </div>

              {/* Progress Section */}
              <div className="bg-[#1A1A1D]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] hover:animate-shimmer pointer-events-none" />

                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <span className="w-1 h-6 bg-[#06b5cc] rounded-full mr-3" />
                  Learning Journey
                </h2>

                <div className="flex justify-between items-end mb-3">
                  <span className="text-[#94A3B8]">Overall Progress</span>
                  <span className="text-2xl font-bold text-[#06b5cc]">
                    {user.stats?.overallProgress || 0}%
                  </span>
                </div>

                <div className="w-full bg-[#111113] rounded-full h-3 p-[2px] border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${user.stats?.overallProgress || 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-[#06b5cc] to-[#2DD4BF] h-full rounded-full relative"
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-full bg-white/20 animate-pulse rounded-full" />
                  </motion.div>
                </div>

                <p className="mt-4 text-sm text-[#94A3B8] italic">
                  "Consistent action creates consistent results." – Keep going!
                </p>
              </div>

              {/* Account Details */}
              <div className="bg-[#1A1A1D]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <span className="w-1 h-6 bg-[#F7C94C] rounded-full mr-3" />
                  Account Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <label className="text-xs text-[#94A3B8] uppercase tracking-wider block mb-1">Full Name</label>
                    <div className="text-white font-medium truncate">{user.name}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <label className="text-xs text-[#94A3B8] uppercase tracking-wider block mb-1">Email Address</label>
                    <div className="text-white font-medium truncate">{user.email}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <label className="text-xs text-[#94A3B8] uppercase tracking-wider block mb-1">Account Type</label>
                    <div className="text-white font-medium capitalize">{user.authProvider || 'Email'}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <label className="text-xs text-[#94A3B8] uppercase tracking-wider block mb-1">Member Since</label>
                    <div className="text-white font-medium">{formatDate(user.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Membership Card */}
              <div className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${user.isPremium ? 'from-[#F7C94C] to-[#F59E0B]' : 'from-[#06b5cc] to-[#2DD4BF]'} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500`}></div>
                <div className="relative bg-[#1A1A1D] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${user.isPremium ? 'bg-[#F7C94C]/10 text-[#F7C94C]' : 'bg-[#06b5cc]/10 text-[#06b5cc]'}`}>
                      <Crown className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${user.isPremium ? 'border-[#F7C94C]/30 text-[#F7C94C]' : 'border-white/10 text-[#94A3B8]'}`}>
                      {user.isPremium ? 'PREMIUM ACCESS' : 'FREE PLAN'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-white">
                    {user.isPremium ? 'Elite Membership' : 'Basic Member'}
                  </h3>

                  <div className="text-[#94A3B8] text-sm mb-6 leading-relaxed">
                    {user.isPremium ? (
                      <div className="space-y-2">
                        <p>Enjoying full access to all lessons, exclusive notes, and AI tutor features.</p>
                        <div className="flex items-center gap-2 text-[#F7C94C] font-semibold text-xs mt-4">
                          <CheckCircle className="w-4 h-4" />
                          All Features Unlocked
                        </div>
                      </div>
                    ) : (
                      'Upgrade to Premium to unlock unlimited access, AI tutoring, and downloadable resources.'
                    )}
                  </div>

                  {!user.isPremium ? (
                    <Link
                      to="/pricing"
                      className="block w-full py-3 md:py-4 bg-gradient-to-r from-[#F7C94C] to-[#F59E0B] hover:from-[#F59E0B] hover:to-[#D97706] text-[#1A1A1D] font-bold rounded-xl text-center shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]"
                    >
                      Upgrade Now
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-[10px] text-center text-[#94A3B8] bg-white/5 py-3 rounded-lg border border-white/5 uppercase tracking-wider font-bold">
                        Plan type: <span className="text-white">{user.premiumPlan ? user.premiumPlan.charAt(0).toUpperCase() + user.premiumPlan.slice(1) : 'Standard'}</span>
                        <div className="mt-1">
                          Valid until {user.premiumExpiry ? formatDate(user.premiumExpiry) : 'Forever'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#1A1A1D]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 text-white">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/subjects"
                    className="flex items-center p-3 bg-white/5 hover:bg-[#06b5cc]/10 border border-white/5 hover:border-[#06b5cc]/30 rounded-xl transition-all group"
                  >
                    <div className="p-2 bg-[#2DD4BF]/10 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-[#2DD4BF]" />
                    </div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white">Continue Learning</span>
                  </Link>

                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.toast) {
                        window.toast.info('Preferences coming soon!');
                      }
                    }}
                    className="w-full flex items-center p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group text-left"
                  >
                    <div className="p-2 bg-white/10 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white">Preferences</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center md:justify-start p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 rounded-xl transition-all group mt-4"
                  >
                    <div className="p-2 bg-red-500/10 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                      <LogOut className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-sm font-medium text-red-400 group-hover:text-red-300">Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}