import { motion } from 'framer-motion';

interface ShapeProps {
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  color: string;
  style?: React.CSSProperties;
}

function ElegantShape({ delay = 0, width = 400, height = 100, rotate = 0, color, style }: ShapeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      style={{ position: 'absolute', ...style }}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width, height, position: 'relative' }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 9999,
          background: `linear-gradient(to right, ${color}, transparent)`,
          backdropFilter: 'blur(2px)',
          border: '1.5px solid rgba(255,255,255,0.7)',
          boxShadow: '0 8px 32px 0 rgba(180,100,80,0.08)',
        }} />
      </motion.div>
    </motion.div>
  );
}

export default function BackgroundOrbs() {
  return (
    <>
      {/* Warm radial wash */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 50% at 15% 30%, rgba(220,140,120,0.22) 0%, transparent 65%),
          radial-gradient(ellipse 60% 45% at 85% 75%, rgba(180,100,60,0.14) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 50% 10%, rgba(240,180,160,0.18) 0%, transparent 55%)
        `,
      }} />

      {/* Floating pill shapes */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <ElegantShape delay={0.3} width={580} height={130} rotate={12}
          color="rgba(210,120,100,0.22)" style={{ left: '-4%', top: '16%' }} />
        <ElegantShape delay={0.5} width={460} height={110} rotate={-15}
          color="rgba(180,90,60,0.18)" style={{ right: '0%', top: '65%' }} />
        <ElegantShape delay={0.4} width={280} height={75} rotate={-8}
          color="rgba(230,160,140,0.2)" style={{ left: '6%', bottom: '10%' }} />
        <ElegantShape delay={0.6} width={190} height={55} rotate={20}
          color="rgba(160,82,45,0.16)" style={{ right: '16%', top: '10%' }} />
        <ElegantShape delay={0.7} width={130} height={36} rotate={-25}
          color="rgba(200,130,100,0.15)" style={{ left: '24%', top: '6%' }} />
      </div>

      {/* Soft top/bottom vignette to blend into bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'linear-gradient(to bottom, rgba(249,237,232,0.4) 0%, transparent 20%, transparent 80%, rgba(249,237,232,0.5) 100%)',
      }} />
    </>
  );
}