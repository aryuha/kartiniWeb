// src/components/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import AtomBackground from '../three/AtomBackground';
import { useProgress } from '../../context/ProgressContext';

// ── Glitch Title Component ──
function GlitchTitle() {
    const text = 'GLOWLAB KARTINI';

    return (
        <>
            <style>{`
        @keyframes glitch-main {
          0%, 90%, 100% { transform: translate(0, 0) skew(0deg); opacity: 1; }
          91%  { transform: translate(-3px, 1px) skew(-1deg); opacity: 0.95; }
          92%  { transform: translate(3px, -1px) skew(1deg);  opacity: 0.95; }
          93%  { transform: translate(0, 0) skew(0deg);       opacity: 1;    }
          94%  { transform: translate(-2px, 2px) skew(-0.5deg); }
          95%  { transform: translate(2px, -2px) skew(0.5deg);  }
          96%  { transform: translate(0, 0);                     }
        }

        @keyframes glitch-red {
          0%, 89%, 100% { clip-path: inset(100% 0 100% 0); transform: translate(0); }
          90%  { clip-path: inset(10% 0 60% 0);  transform: translate(-6px, 0); opacity: 0.8; }
          91%  { clip-path: inset(60% 0 15% 0);  transform: translate(5px, 0);  opacity: 0.8; }
          92%  { clip-path: inset(30% 0 40% 0);  transform: translate(-4px, 0); opacity: 0.8; }
          93%  { clip-path: inset(80% 0 5% 0);   transform: translate(6px, 0);  opacity: 0.8; }
          94%  { clip-path: inset(45% 0 25% 0);  transform: translate(-3px, 0); opacity: 0.8; }
          95%  { clip-path: inset(100% 0 100% 0); transform: translate(0); }
        }

        @keyframes glitch-blue {
          0%, 89%, 100% { clip-path: inset(100% 0 100% 0); transform: translate(0); }
          90%  { clip-path: inset(40% 0 30% 0);  transform: translate(6px, 0);  opacity: 0.8; }
          91%  { clip-path: inset(15% 0 70% 0);  transform: translate(-5px, 0); opacity: 0.8; }
          92%  { clip-path: inset(70% 0 10% 0);  transform: translate(4px, 0);  opacity: 0.8; }
          93%  { clip-path: inset(20% 0 55% 0);  transform: translate(-6px, 0); opacity: 0.8; }
          94%  { clip-path: inset(55% 0 20% 0);  transform: translate(3px, 0);  opacity: 0.8; }
          95%  { clip-path: inset(100% 0 100% 0); transform: translate(0); }
        }

        @keyframes glitch-scan {
          0%, 89%, 100% { opacity: 0; }
          90%  { opacity: 0.06; transform: translateY(-2px); }
          91%  { opacity: 0.04; transform: translateY(3px);  }
          92%  { opacity: 0.07; transform: translateY(-1px); }
          93%  { opacity: 0;    }
          94%  { opacity: 0.05; transform: translateY(2px);  }
          95%  { opacity: 0;    }
        }

        @keyframes flicker {
          0%, 95%, 100% { opacity: 1; }
          96%  { opacity: 0.88; }
          97%  { opacity: 1;    }
          98%  { opacity: 0.92; }
          99%  { opacity: 1;    }
        }

        @keyframes glow-pulse {
          0%, 100% { text-shadow:
            0 0 10px rgba(37,99,235,0.3),
            0 0 20px rgba(37,99,235,0.15),
            0 4px 24px rgba(37,99,235,0.18);
          }
          50% { text-shadow:
            0 0 20px rgba(37,99,235,0.6),
            0 0 40px rgba(37,99,235,0.3),
            0 0 60px rgba(37,99,235,0.15),
            0 4px 24px rgba(37,99,235,0.25);
          }
        }

        .glitch-wrapper {
          position: relative;
          display: inline-block;
          animation:
            glitch-main 6s ease-in-out infinite,
            flicker 8s ease-in-out infinite,
            glow-pulse 3s ease-in-out infinite;
        }

        .glitch-wrapper::before,
        .glitch-wrapper::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          font-size: inherit;
          font-weight: inherit;
          letter-spacing: inherit;
          font-family: inherit;
          line-height: inherit;
          white-space: nowrap;
          pointer-events: none;
        }

        .glitch-wrapper::before {
          color: #ef4444;
          animation: glitch-red 6s ease-in-out infinite;
          text-shadow: none;
        }

        .glitch-wrapper::after {
          color: #06b6d4;
          animation: glitch-blue 6s ease-in-out infinite;
          text-shadow: none;
        }

        .glitch-scan {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(37,99,235,0.03) 2px,
            rgba(37,99,235,0.03) 4px
          );
          animation: glitch-scan 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes floatDot {
          0%, 100% { transform: translateY(0px);    opacity: 0.35; }
          50%      { transform: translateY(-12px);   opacity: 0.8;  }
        }

        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }
      `}</style>

            <div style={{ position: 'relative', marginBottom: '20px' }}>
                <div className="glitch-scan" />
                <h1
                    className="glitch-wrapper"
                    data-text={text}
                    style={{
                        fontSize: 'clamp(52px, 7.5vw, 100px)',
                        fontWeight: 900,
                        color: '#1e3a8a',
                        letterSpacing: '6px',
                        margin: 0,
                        lineHeight: 1.05,
                        fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
                        userSelect: 'none',
                    }}
                >
                    {text}
                </h1>
            </div>
        </>
    );
}

// ── Ornamen pojok SVG ──
function CornerOrnament() {
    return (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path d="M4 4 L4 24" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
            <path d="M4 4 L24 4" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
            <path d="M4 4 L16 16" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" />
            <circle cx="4" cy="4" r="3" fill="#2563eb" fillOpacity="0.5" />
            <circle cx="24" cy="4" r="1.5" fill="#2563eb" fillOpacity="0.3" />
            <circle cx="4" cy="24" r="1.5" fill="#2563eb" fillOpacity="0.3" />
        </svg>
    );
}

// ── Floating dots animasi ──
function FloatingDots() {
    const dots = [
        { top: '15%', left: '8%', size: 6, delay: '0s', dur: '4s' },
        { top: '25%', right: '6%', size: 4, delay: '1s', dur: '5s' },
        { top: '70%', left: '5%', size: 5, delay: '2s', dur: '3.5s' },
        { top: '60%', right: '8%', size: 7, delay: '0.5s', dur: '4.5s' },
        { top: '40%', left: '3%', size: 3, delay: '1.5s', dur: '6s' },
        { top: '80%', right: '5%', size: 4, delay: '2.5s', dur: '4s' },
        { top: '10%', left: '40%', size: 3, delay: '3s', dur: '5s' },
        { top: '85%', left: '30%', size: 5, delay: '0.8s', dur: '3.8s' },
    ];

    return (
        <>
            {dots.map((d, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        top: d.top,
                        left: d.left,
                        right: d.right,
                        width: d.size,
                        height: d.size,
                        borderRadius: '50%',
                        background: '#2563eb',
                        opacity: 0.4,
                        animation: `floatDot ${d.dur} ${d.delay} ease-in-out infinite`,
                        zIndex: 2,
                        pointerEvents: 'none',
                    }}
                />
            ))}
        </>
    );
}

// ── Main HomePage ──
export default function HomePage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { resetProgress } = useProgress();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timer);
        resetProgress();
    }, []);

    return (
        <div style={s.container}>
            {/* Three.js Background */}
            <div style={s.bgWrapper}>
                <AtomBackground />
            </div>

            {/* Grid overlay */}
            <div style={s.gridOverlay} />

            {/* Ornamen pojok */}
            <div style={{ ...s.corner, top: 20, left: 20 }}>
                <CornerOrnament />
            </div>
            <div style={{ ...s.corner, top: 20, right: 20, transform: 'scaleX(-1)' }}>
                <CornerOrnament />
            </div>
            <div style={{ ...s.corner, bottom: 20, left: 20, transform: 'scaleY(-1)' }}>
                <CornerOrnament />
            </div>
            <div style={{ ...s.corner, bottom: 20, right: 20, transform: 'scale(-1,-1)' }}>
                <CornerOrnament />
            </div>

            {/* Garis horizontal dekoratif */}
            <div style={s.hLineTop} />
            <div style={s.hLineBottom} />

            {/* Floating dots */}
            <FloatingDots />

            {/* Language Switcher */}
            <div style={s.langPos}>
                <LanguageSwitcher />
            </div>

            {/* Hero Content */}
            <div
                style={{
                    ...s.hero,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.9s ease, transform 0.9s ease',
                }}
            >
                {/* Badge */}
                <div style={s.badge}>
                    <span style={s.badgeDot}>◆</span>
                    <span style={s.badgeText}>BRIN · INDONESIA · REAKTOR</span>
                    <span style={s.badgeDot}>◆</span>
                </div>

                {/* Glitch Title */}
                <GlitchTitle />

                {/* Subtitle */}
                <div style={s.subtitleRow}>
                    <div style={s.subLine} />
                    <span style={s.subtitle}>{t('homeSubtitle')}</span>
                    <div style={s.subLine} />
                </div>

                {/* Description */}
                <p style={s.desc}>
                    {t('homeDescription') ||
                        'Simulasi virtual Reaktor Kartini – Reaktor Riset TRIGA Mark II milik BRIN Yogyakarta. Kendalikan batang kontrol, pantau daya reaktor, dan pelajari fisika reaktor nuklir secara aman.'}
                </p>

                {/* CTA Button */}
                <button
                    style={s.cta}
                    onClick={() => navigate('/prepare')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1e4fd8';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.35)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#1e4fd8';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {t('btnSelengkapnya')}
                </button>

            </div>

            {/* Footer */}
            <div style={s.footer}>
                <p style={s.footerText}>{t('footerText')}</p>
                <p style={s.footerSub}>{t('footerSub')}</p>
            </div>
        </div>
    );
}

// ── Styles ──
const s = {
    container: {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#dce8f5',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgWrapper: {
        position: 'absolute',
        inset: 0,
        zIndex: 1,
    },
    gridOverlay: {
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        backgroundImage: `
      linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)
    `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
    },
    corner: {
        position: 'absolute',
        zIndex: 5,
        pointerEvents: 'none',
    },
    hLineTop: {
        position: 'absolute',
        top: 60,
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.25), transparent)',
        zIndex: 3,
        pointerEvents: 'none',
    },
    hLineBottom: {
        position: 'absolute',
        bottom: 60,
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.25), transparent)',
        zIndex: 3,
        pointerEvents: 'none',
    },
    langPos: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 100,
    },
    hero: {
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 24px',
        maxWidth: '800px',
    },
    badge: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(37,99,235,0.3)',
        borderRadius: 999,
        padding: '7px 20px',
        marginBottom: 28,
        boxShadow: '0 2px 12px rgba(37,99,235,0.1)',
    },
    badgeDot: {
        color: '#2563eb',
        fontSize: 7,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '3px',
        color: '#1e3a8a',
        fontFamily: "'Rajdhani', sans-serif",
    },
    subtitleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 28,
    },
    subLine: {
        width: 52,
        height: 1.5,
        background: 'linear-gradient(90deg, transparent, #2563eb)',
        opacity: 0.6,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '5px',
        color: '#2563eb',
        fontFamily: "'Rajdhani', sans-serif",
    },
    desc: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 1.9,
        maxWidth: 560,
        marginBottom: 44,
    },
    cta: {
        backgroundColor: 'transparent',
        color: '#1e4fd8',
        border: '2px solid #1e4fd8',
        borderRadius: 8,
        padding: '15px 56px',
        fontSize: 14,
        fontWeight: 800,
        letterSpacing: '3px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontFamily: "'Rajdhani', sans-serif",
        marginBottom: 36,
    },
    scrollHint: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
    },
    scrollDot: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#2563eb',
        opacity: 0.5,
        animation: 'scrollBounce 2s ease-in-out infinite',
    },
    scrollText: {
        fontSize: 11,
        color: '#6B7280',
        letterSpacing: '1px',
        margin: 0,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        textAlign: 'center',
        zIndex: 10,
    },
    footerText: {
        fontSize: 11,
        color: '#6B7280',
        margin: '0 0 2px 0',
    },
    footerSub: {
        fontSize: 10,
        color: '#9CA3AF',
        margin: 0,
    },
};