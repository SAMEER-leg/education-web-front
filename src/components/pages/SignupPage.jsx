import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Check password strength
    if (!/(?=.*[a-z])/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      setLoading(false);
      return;
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      setLoading(false);
      return;
    }

    if (!/(?=.*\d)/.test(password)) {
      setError('Password must contain at least one number');
      setLoading(false);
      return;
    }

    try {
      const result = await signup(name, email, password);

      if (result.success) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/subjects');
        }, 1500);
      } else {
        // Display validation errors if available
        if (result.errors && result.errors.length > 0) {
          setError(result.errors.map(err => err.message).join(', '));
        } else {
          setError(result.message || 'Signup failed');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-20">
    <div className="w-full max-w-md mx-auto">
      <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="w-20 md:w-32 h-auto mx-auto mb-4" />
          <h1 className="mb-2">Create Account</h1>
          <p className="text-[#94A3B8]">Join thousands of students mastering mathematics</p>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-[#111113] to-[#111113]/50 border border-white/10 rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>}

            {success && <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
              {success}
            </div>}

            <div>
              <label className="block text-sm mb-2 text-[#94A3B8]">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="off"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#06b5cc] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-[#94A3B8]">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="off"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#06b5cc] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-[#94A3B8]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#06b5cc] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                 absolute right-0 top-1/2 -translate-y-1/2
                 h-[85%] w-12
                 flex items-center justify-center
                 rounded-full
                 bg-gradient-to-b from-[#11282b] to-[#06b5cc]/40
                 border border-white/10
                 text-[#94A3B8]
                 hover:text-white
                 transition-all duration-300
                 hover:shadow-[0_0_8px_rgba(6,181,204,0.4)]
               "

                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>
              <p className="mt-2 text-xs text-[#94A3B8]">
                Password must contain: 6+ characters, uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2 text-[#94A3B8]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#06b5cc] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="
  absolute right-0 top-1/2 -translate-y-1/2
  h-[85%] w-12
  flex items-center justify-center
  rounded-full
  bg-gradient-to-b from-[#11282b] to-[#06b5cc]/40
  border border-white/10
  text-[#94A3B8]
  hover:text-white
  transition-all duration-300
  hover:shadow-[0_0_8px_rgba(6,181,204,0.4)]
"

                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-orange transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#94A3B8]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#06b5cc] hover:text-[#EADADA] transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-6 text-xs text-[#94A3B8] text-center">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-[#06b5cc] hover:text-[#EADADA] transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-[#06b5cc] hover:text-[#EADADA] transition-colors">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  </div>;
}