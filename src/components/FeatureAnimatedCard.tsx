import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, TrendingDown, Target, Sparkles, ChevronRight } from 'lucide-react';

const containerVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.15, delayChildren: 0.1, duration: 0.4 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

export const FeatureAnimatedCard: React.FC = () => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div style={{ marginTop: '2rem' }}>
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="teaser"
            onClick={() => setIsRevealed(true)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -3, 0],
              boxShadow: [
                "0 4px 12px rgba(5,85,200,0.1)", 
                "0 12px 24px rgba(5,85,200,0.3)", 
                "0 4px 12px rgba(5,85,200,0.1)"
              ]
            }}
            transition={{ 
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            style={{
              background: 'linear-gradient(90deg, #d36a32 0%, #155bc6 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.75rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Sparkles size={28} style={{ color: '#fff', opacity: 0.9 }} />
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              Want to save even more time & money?
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.85, fontWeight: 500 }}>
              Unlock an additional 80% savings with candidate search.
            </p>
            <div style={{ 
              marginTop: '0.5rem', 
              background: 'rgba(255,255,255,0.2)', 
              padding: '0.4rem 1rem', 
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backdropFilter: 'blur(4px)'
            }}>
              Click to reveal <ChevronRight size={14} />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="full-card"
            className="feature-promo-card"
            style={{ marginTop: 0 }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="promo-badge">
              <Database size={14} style={{ marginRight: '6px' }} />
              Candidate Search
            </motion.div>
            
            <motion.h4 variants={itemVariants} className="promo-title">
              Never lose a great candidate again.
            </motion.h4>

            <motion.div variants={itemVariants} className="promo-image-wrapper">
              <img 
                src="/assets/pileofresumes.jpg" 
                alt="Pile of Resumes" 
                className="promo-image"
                onError={(e) => {
                  if (!(e.target as HTMLImageElement).src.includes('/pileofresumes.jpg')) {
                    (e.target as HTMLImageElement).src = '/pileofresumes.jpg';
                  }
                }}
              />
              <div className="promo-image-overlay" />
            </motion.div>

            <motion.div variants={itemVariants} className="promo-highlight">
              <div className="promo-number-box">
                <span className="promo-number">80%</span>
                <span className="promo-number-sub">Time & Money Saved</span>
              </div>
              <p className="promo-desc">Optimize your candidate hunt natively.</p>
            </motion.div>

            <motion.ul variants={itemVariants} className="promo-points">
              <motion.li variants={itemVariants}>
                <Target size={16} className="point-icon" />
                <span><strong>Store existing data</strong> within Skillbrew securely.</span>
              </motion.li>
              <motion.li variants={itemVariants}>
                <Database size={16} className="point-icon" />
                <span><strong>Stop losing data</strong> and preserve candidate history.</span>
              </motion.li>
              <motion.li variants={itemVariants}>
                <TrendingDown size={16} className="point-icon" />
                <span><strong>Stop paying extra</strong> portal fees for people you already mapped!</span>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
