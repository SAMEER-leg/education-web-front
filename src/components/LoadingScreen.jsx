import { motion } from 'motion/react';
import { useMemo } from 'react';

export default function LoadingScreen({ settings }) {
  const platformName = settings?.branding?.platformName || settings?.platformName || 'Loading...';
  const tagline = settings?.branding?.tagline || '';

  // Dynamic colors
  const colors = settings?.branding?.colors || {};
  const bgColor = colors.background || '#0B0B0D';
  const primaryColor = colors.primary || '#06b5cc';
  const secondaryColor = colors.secondary || '#EF4444';
  const accentColor = colors.accent || '#C1272D';

  // Generate random particles once for performance
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }));
  }, []);

  // Container variants with cinematic zoom-in
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.18,
        delayChildren: 0.5
      }
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      filter: "blur(15px)",
      transition: {
        staggerChildren: 0.08,
        staggerDirection: -1,
        when: "afterChildren",
        duration: 0.8
      }
    }
  };

  const charVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.7, rotate: -10 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100,
        mass: 1.2
      }
    },
    exit: {
      opacity: 0,
      y: -60,
      scale: 0.7,
      transition: { duration: 0.4 }
    }
  };

  const taglineVariants = {
    hidden: { opacity: 0, y: 15, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: 1.6,
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0,
      filter: "blur(10px)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{ backgroundColor: bgColor }}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* 🎞️ Atmospheric Layer: Vignette & Noise */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background: `radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 100%)`,
        }}
      />

      {/* ✨ Sparkle Particles Layer */}
      <div className="absolute inset-0 z-[2] pointer-events-none opacity-40">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              filter: 'blur(1px)'
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 0.8, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* 🎡 Orbital Rings Layer */}
      <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] border border-white/5 rounded-full"
          style={{ borderStyle: 'dashed', borderDasharray: '4 12' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] border border-white/5 rounded-full"
          style={{ borderStyle: 'dotted', borderDasharray: '2 8' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] border border-white/10 rounded-full"
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 🌊 Dynamic Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[0]">
        <motion.div
          className="absolute -top-[10%] -left-[5%] w-[80%] h-[80%] rounded-full blur-[140px]"
          style={{ backgroundColor: primaryColor }}
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.2, 0.85, 1],
            opacity: [0.15, 0.25, 0.18, 0.15]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-[20%] -right-[15%] w-[70%] h-[70%] rounded-full blur-[120px]"
          style={{ backgroundColor: accentColor }}
          animate={{
            x: [0, -70, 30, 0],
            y: [0, 50, -40, 0],
            scale: [1, 1.25, 0.9, 1],
            opacity: [0.1, 0.22, 0.12, 0.1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 1 }}
        />
        <motion.div
          className="absolute top-[30%] left-[25%] w-[50%] h-[50%] rounded-full blur-[180px]"
          style={{ backgroundColor: secondaryColor }}
          animate={{
            scale: [0.7, 1.2, 0.7],
            opacity: [0.03, 0.08, 0.03]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center p-8 text-center"
        variants={containerVariants}
      >
        {/* Pulsing Central Glow */}
        <motion.div
          className="absolute inset-0 blur-[80px] rounded-full z-[-1]"
          style={{ backgroundColor: primaryColor }}
          animate={{
            opacity: [0.08, 0.3, 0.08],
            scale: [0.9, 1.4, 0.9]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* 📚 Book Logo Variant */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 relative"
        >
          <img
            src="/logo.png"
            alt="StudySouq Logo"
            className="w-24 h-24 md:w-32 md:h-32 object-contain filter drop-shadow-[0_0_20px_rgba(6,181,204,0.6)] animate-pulse"
          />
          <div className="absolute inset-0 bg-[#06b5cc]/20 blur-2xl rounded-full -z-10 animate-pulse" />
        </motion.div>

        {/* Platform Name Section */}
        <div className="flex flex-wrap justify-center relative px-12 perspective-1000">
          {platformName.split('').map((char, index) => (
            <motion.span
              key={index}
              variants={charVariants}
              className="font-[900] tracking-tight relative"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(3rem, 10vw, 7rem)",
                lineHeight: "1.2",
                color: 'white',
                textShadow: '0 15px 45px rgba(0,0,0,0.6)',
                padding: '0 6px',
                display: 'inline-block'
              }}
            >
              {char === ' ' ? '\u00A0' : char}

              {/* ✨ Glimmer Overlay */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] pointer-events-none"
                animate={{
                  left: ['-150%', '300%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.15 + 1.2
                }}
              />
            </motion.span>
          ))}
        </div>

        {/* Tagline */}
        {tagline && (
          <motion.p
            variants={taglineVariants}
            className="mt-10 font-bold uppercase tracking-[0.6em]"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(0.9rem, 1.8vw, 1.4rem)",
              color: 'rgba(255,255,255,0.7)',
              textShadow: '0 5px 15px rgba(0,0,0,0.3)'
            }}
          >
            {tagline}
          </motion.p>
        )}

        {/* Cinematic Progress Bar */}
        <motion.div
          className="mt-16 w-64 h-[2px] bg-white/10 rounded-full overflow-hidden relative shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.8, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent"
            animate={{
              left: ['-100%', '200%']
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
