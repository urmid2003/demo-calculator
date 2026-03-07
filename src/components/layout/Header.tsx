import { motion } from 'framer-motion';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: [0.25, 0.4, 0.25, 1] as const },
});

export default function Header() {
  return (
    <header style={{ padding: '64px 0 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>

      <motion.div {...fadeUp(0.3)} style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '6px 18px', borderRadius: 9999,
        background: 'rgba(180,100,60,0.08)',
        border: '1px solid rgba(180,100,60,0.2)',
        fontSize: 12, fontWeight: 600, color: '#8b4a2a',
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        Skillbrew ROI Calculator
      </motion.div>

      <motion.h1 {...fadeUp(0.5)}>
        <span style={{
          display: 'block',
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
          fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.02em',
          background: 'linear-gradient(to bottom, #1a0f0a 0%, #3d1f14 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Hiring Cost & Time
        </span>
        <span style={{
          display: 'block',
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
          fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.02em',
          background: 'linear-gradient(to right, #c0705a, #6b2d1a, #c0705a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Calculator
        </span>
      </motion.h1>

      <motion.p {...fadeUp(0.7)} style={{
        fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
        color: 'rgba(60,25,10,0.5)', maxWidth: 520, lineHeight: 1.7,
        fontWeight: 300, letterSpacing: '0.01em',
      }}>
        Discover exactly how much your team spends on recruitment — and see the
        savings when you switch to Skillbrew. All figures computed annually.
      </motion.p>
    </header>
  );
}