import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, MessageSquare, FileText, Lightbulb } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import * as LucideIcons from 'lucide-react';
import nextGenIcon from '../../assets/16406245.png';

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();

  useEffect(() => {
    const targetSection = location.state?.targetSection;
    const hashSection = location.hash ? location.hash.replace('#', '') : null;
    const sectionToScroll = targetSection || hashSection;

    if (sectionToScroll) {
      // Allow DOM to paint before scrolling
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

  // Get features from settings - NO FALLBACKS, show empty if none
  const features = (settings.homepage?.features || []).map(feature => {
    const IconComponent = LucideIcons[feature.icon] || FileText;
    return {
      icon: IconComponent,
      title: feature.title || '',
      description: feature.description || '',
      color: feature.color || '#06b5cc'
    };
  }).filter(f => f.title || f.description); // Only show features with content

  return <div className="relative overflow-hidden">
    {/* Hero Section */}
    <section id="home" className="relative homepage-hero-section scroll-mt-24 lg:scroll-mt-32 overflow-hidden">
      {/* Premium Background System */}
      <div className="absolute inset-0 z-0 bg-mesh opacity-60" />

      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#06b5cc]/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#11282b]/30 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-7xl mx-auto z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center min-h-0 md:min-h-[600px] pt-4 pb-12 md:pt-0 md:pb-12 lg:py-0">
          <div className="text-left">
            <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8,
              ease: "easeOut"
            }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06b5cc]/10 border border-[#06b5cc]/20 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b5cc] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06b5cc]"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#06b5cc]">Next-Gen Learning</span>
              </div>

              <h1 className="mb-6 text-white leading-[1.1] text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight uppercase">
                <span className="text-gradient-cyan">
                  {settings.homepage?.hero?.title || 'Smarter Way\nto Learn'}
                </span>
              </h1>
            </motion.div>

            <motion.p initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8,
              delay: 0.2,
              ease: "easeOut"
            }} className="text-[#94A3B8] text-lg sm:text-xl lg:text-2xl mb-10 max-w-xl leading-relaxed font-light">
              {settings.homepage?.hero?.description || 'Learn faster with structured lessons, smart notes, and an AI-powered learning experience designed for modern students.'}
            </motion.p>

            <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8,
              delay: 0.4,
              ease: "easeOut"
            }}
              className="flex flex-col sm:flex-row gap-4 justify-start items-center sm:items-start"
            >
              <Link to="/subjects" className="w-full sm:w-auto px-6 py-4 sm:px-10 sm:py-5 text-lg btn-orange transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#06b5cc]/30 rounded-xl text-center">
                {settings.homepage?.hero?.ctaText || 'Explore Platform'}
              </Link>
              <Link to="/about" className="w-full sm:w-auto px-6 py-4 sm:px-10 sm:py-5 text-lg border border-white/10 hover:bg-white/5 text-white transition-all duration-300 rounded-xl font-medium text-center">
                Learn More
              </Link>
            </motion.div>
          </div>

          <div className="flex justify-center md:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-[500px] animate-float"
            >
              {/* Decorative Glow behind image */}
              <div className="absolute -inset-10 bg-[#06b5cc]/30 blur-[120px] rounded-full opacity-60" />

              <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] group">
                {/* Background Image */}
                <img
                  src={settings.homepage?.hero?.heroImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000'}
                  alt={settings.branding?.platformName || "Study Souq"}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                />

                {/* Glassmorphic Overlay for Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden"
                  >
                    {/* Glowing effect inside plate */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#06b5cc] to-transparent opacity-50" />

                    <h2 className="text-2xl sm:text-3xl font-black text-gradient-cyan mb-2 tracking-tighter uppercase leading-none">
                      Next-Gen <br />
                      <span className="text-gradient-cyan">Learning Hub</span>
                    </h2>
                    <p className="text-[#94A3B8] text-sm font-medium uppercase tracking-[0.2em]">Explore. Discover. Master.</p>
                  </motion.div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-[#0B0B0D]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl z-20 shadow-xl hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 bg-[#06b5cc] rounded-full flex items-center justify-center">
                  <LucideIcons.Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">AI Powered</p>
                  <p className="text-[#94A3B8] text-xs">Modern Learning</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section id="subjects" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24 lg:scroll-mt-32">
      <div className="max-w-7xl mx-auto">
        <motion.h2 initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="text-center mb-16 text-white text-3xl font-bold">
          Everything You Need to Excel
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.length > 0 ? features.map((feature, index) => <motion.div key={feature.title || index} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: index * 0.1
          }} whileHover={{
            y: -8
          }} className="bg-gradient-to-br from-[#111113] to-[#111113]/50 border border-white/10 rounded-2xl p-6 md:p-8 hover:border-white/20 transition-all duration-300 hover:shadow-xl">
            {feature.badge && <div className="mb-6 text-left text-sm uppercase tracking-wide text-[#EADADA]">
              {feature.badge}
            </div>}
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{
              backgroundColor: `${feature.color}20`
            }}>
              {feature.icon && <feature.icon className="w-8 h-8 text-white" />}
            </div>
            {feature.title && <h3 className="mb-4 text-white text-xl font-semibold">{feature.title}</h3>}
            {feature.description && <p className="text-[#94A3B8]">{feature.description}</p>}
          </motion.div>) : (
            <div className="col-span-full bg-gradient-to-br from-[#111113] to-[#111113]/50 border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-[#94A3B8] text-lg mb-2">No features available.</p>
              <p className="text-[#94A3B8] text-sm">Please add features from the admin dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section id="pricing" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24 lg:scroll-mt-32">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="bg-gradient-to-br from-[#11282b]/40 to-[#06b5cc]/10 border border-[#06b5cc]/30 rounded-3xl p-8 md:p-12 text-center shadow-lg shadow-[#06b5cc]/5">
          {settings.homepage?.cta?.title ? (
            <h2 className="mb-6 text-white text-3xl font-bold">{settings.homepage.cta.title}</h2>
          ) : (
            <h2 className="mb-6 text-white text-3xl font-bold">Call to Action Section</h2>
          )}
          {settings.homepage?.cta?.description ? (
            <p className="text-[#94A3B8] text-lg mb-8">
              {settings.homepage.cta.description}
            </p>
          ) : (
            <p className="text-[#94A3B8] text-lg mb-8 italic">
              CTA description content is not configured. Please add this content from the admin dashboard.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/subjects" className="px-8 py-4 btn-orange rounded-xl transition-all duration-300">
              Browse Subjects
            </Link>
            <Link to="/pricing" state={{ targetSection: 'pricing-plans' }} className="px-8 py-4 border border-[#F7C94C] text-white hover:bg-[#F7C94C]/10 rounded-xl transition-all duration-300">
              View Pricing
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  </div>;
}