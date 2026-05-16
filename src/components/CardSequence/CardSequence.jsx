import { useState, useEffect, useMemo, useCallback } from 'react';
import './CardSequence.css';

/* ── Heart shape coordinates (normalized -1..1) ─────────────── */
function generateHeartPoints(count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * 2 * Math.PI;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    points.push({ x: x / 17, y: y / 17 }); // normalize to ~[-1, 1]
  }
  return points;
}

/* ── Ring positions (circle) ──────────────────────────────────── */
function generateRingPoints(count, radius) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }
  return points;
}

const HEART_ICONS = ['❤️', '💖', '✨', '🌟', '💕', '💗'];
const HEART_COUNT = 40;

const SCREENS = [
  { type: 'text', content: 'Desde que tengo memoria, has sido mi gran inspiración.' },
  { type: 'text', content: 'Quiero que sepas que te quiero muchísimo y estoy muy orgulloso de ti.' },
  { type: 'photo', image: '/foto1.jpeg', content: '📸 [Asegúrate de tener foto1.jpg en la carpeta public]' },
  { type: 'text', content: 'Gracias por estar siempre ahí, en las buenas y en las malas.' },
  { type: 'text', content: 'Eres una persona increíble y mereces todo lo bonito que te pase hoy y siempre.' },
  { type: 'photo', image: '/foto2.jpeg', content: '📸 [Asegúrate de tener foto2.jpg en la carpeta public]' },
  { type: 'text', content: 'Nunca olvides lo mucho que te adoro, Alejandra.' },
  { type: 'final' } // Triggers heart animation
];

function CardSequence() {
  const [screenIndex, setScreenIndex] = useState(0);
  const [animationState, setAnimationState] = useState('entering'); // 'entering' | 'entered' | 'exiting'

  // States for final heart animation
  const [finalPhase, setFinalPhase] = useState(null); // 'ring' | 'spiral' | 'heart'
  const [ringRotation, setRingRotation] = useState(0);

  const heartPoints = useMemo(() => generateHeartPoints(HEART_COUNT), []);

  /* ── Screen Transition Logic ─────────────────────────────── */
  useEffect(() => {
    if (animationState === 'entering') {
      const timer = setTimeout(() => setAnimationState('entered'), 100);
      return () => clearTimeout(timer);
    }
  }, [animationState, screenIndex]);

  const goToNextScreen = () => {
    if (animationState !== 'entered' || screenIndex >= SCREENS.length - 1) return;

    setAnimationState('exiting');
    setTimeout(() => {
      setScreenIndex((prev) => prev + 1);
      setAnimationState('entering');
    }, 600); // Wait for exit animation
  };

  /* ── Final Phase Sequencing ─────────────────────────────── */
  useEffect(() => {
    const currentScreen = SCREENS[screenIndex];
    if (currentScreen.type === 'final' && animationState === 'entered' && !finalPhase) {
      setFinalPhase('ring');

      setTimeout(() => {
        setFinalPhase('spiral');
      }, 3000); // 3 seconds of ring

      setTimeout(() => {
        setFinalPhase('heart');
      }, 6000); // 3 seconds of spiral
    }
  }, [screenIndex, animationState, finalPhase]);

  /* ── Ring rotation animation ─────────────────────────────── */
  useEffect(() => {
    if (finalPhase !== 'ring' && finalPhase !== 'spiral') return;

    let frame;
    let rotation = ringRotation;

    const animate = () => {
      rotation += 0.3;
      setRingRotation(rotation);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [finalPhase]);

  /* ── Compute particle positions ─────────────────────────── */
  const getParticleStyle = useCallback(
    (index) => {
      const heartSize = Math.min(window.innerWidth * 0.8, 380);
      const ringRadius = Math.min(window.innerWidth * 0.4, 250);
      const particleSize = 30;

      if (finalPhase === 'ring') {
        const angle = (index / HEART_COUNT) * 360 + ringRotation;
        const rad = (angle * Math.PI) / 180;
        return {
          transform: `translate(${Math.cos(rad) * ringRadius}px, ${Math.sin(rad) * ringRadius}px) scale(1)`,
          opacity: 1,
          width: `${particleSize}px`,
          height: `${particleSize}px`,
          transition: 'transform 0.05s linear, opacity 0.6s ease',
        };
      }

      if (finalPhase === 'spiral') {
        const angle = (index / HEART_COUNT) * 360 + ringRotation;
        const rad = (angle * Math.PI) / 180;
        const shrinkFactor = Math.max(0.3, 1 - (ringRotation % 360) / 600);
        const r = ringRadius * shrinkFactor;

        const heartTarget = heartPoints[index];
        const mix = Math.min(1, (ringRotation % 360) / 300);

        const ringX = Math.cos(rad) * r;
        const ringY = Math.sin(rad) * r;
        const heartX = heartTarget.x * heartSize * 0.5;
        const heartY = heartTarget.y * heartSize * 0.5;

        const x = ringX * (1 - mix) + heartX * mix;
        const y = ringY * (1 - mix) + heartY * mix;

        return {
          transform: `translate(${x}px, ${y}px) scale(${0.8 + mix * 0.4})`,
          opacity: 1,
          width: `${particleSize}px`,
          height: `${particleSize}px`,
          transition: 'transform 0.05s linear',
        };
      }

      if (finalPhase === 'heart') {
        const pt = heartPoints[index];
        return {
          transform: `translate(${pt.x * heartSize * 0.5}px, ${pt.y * heartSize * 0.5}px) scale(1.2)`,
          opacity: 1,
          width: `${particleSize}px`,
          height: `${particleSize}px`,
          transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
        };
      }

      // Hidden
      return {
        transform: 'translate(0, 0) scale(0)',
        opacity: 0,
        width: `${particleSize}px`,
        height: `${particleSize}px`,
        transition: 'transform 0.6s ease, opacity 0.6s ease',
      };
    },
    [finalPhase, ringRotation, heartPoints]
  );

  const currentScreen = SCREENS[screenIndex];
  const isFinal = currentScreen.type === 'final';

  return (
    <section className="section gallery" id="photo-gallery">
      {!isFinal ? (
        <div
          className={`screen-card screen-card--${animationState}`}
          onClick={goToNextScreen}
        >
          {currentScreen.type === 'text' && (
            <h2 className="screen-card__text gradient-text">
              {currentScreen.content}
            </h2>
          )}
          {currentScreen.type === 'photo' && (
            <div className="screen-card__photo-container glass-card">
              {currentScreen.image ? (
                <img src={currentScreen.image} alt="Foto de recuerdo" className="screen-card__image" />
              ) : (
                <span className="screen-card__photo-text">{currentScreen.content}</span>
              )}
            </div>
          )}

          <p className="screen-card__hint">Haz clic para continuar</p>
        </div>
      ) : (
        <div className="heart-scene">
          <div className={`heart-scene__container ${finalPhase === 'heart' ? 'heart-scene__container--pulse' : ''}`}>
            {Array.from({ length: HEART_COUNT }, (_, i) => (
              <div
                key={i}
                className="heart-scene__particle"
                style={getParticleStyle(i)}
              >
                {HEART_ICONS[i % HEART_ICONS.length]}
              </div>
            ))}
          </div>

          {finalPhase === 'heart' && (
            <div className="heart-scene__footer">
              <h2 className="heart-scene__footer-title gradient-text">
                ¡Feliz Cumpleaños!
              </h2>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default CardSequence;
