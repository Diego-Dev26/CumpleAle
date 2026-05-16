import { useEffect, useRef, useState, useCallback } from 'react';
import './Countdown.css';

/* ── Matrix Rain Characters ─────────────────────────────────── */
const MATRIX_CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&♡♥★✦❀✿∞';

/* ── Sequence Configuration ──────────────────────────────────── */
const COUNTDOWN = ['3', '2', '1'];
const WORDS = ['FELIZ', 'CUMPLEAÑOS', 'A', 'LA MEJOR', 'HERMANA'];

const COUNTDOWN_INTERVAL_MS = 1100;
const WORD_FADE_IN_MS = 600;
const WORD_HOLD_MS = 900;
const WORD_FADE_OUT_MS = 500;
const WORD_TOTAL_MS = WORD_FADE_IN_MS + WORD_HOLD_MS + WORD_FADE_OUT_MS;
const FINAL_HOLD_MS = 2200;

/**
 * Countdown — Sección 1: Cuenta Regresiva
 *
 * Lluvia digital Matrix en fucsia vibrante a pantalla completa,
 * cuenta regresiva 3→2→1, luego revelación palabra por palabra:
 * "FELIZ" → "CUMPLEAÑOS" → "A" → "Ale".
 *
 * @param {Object} props
 * @param {() => void} [props.onComplete] — se llama cuando la secuencia termina
 */
function Countdown({ onComplete }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const dropsRef = useRef([]);

  /* ── State machine: 'countdown' → 'words' → 'done' ─────── */
  const [phase, setPhase] = useState('countdown');      // 'countdown' | 'words' | 'done'
  const [countdownVal, setCountdownVal] = useState(null); // '3','2','1'
  const [countdownVisible, setCountdownVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [wordAnim, setWordAnim] = useState('');           // '' | 'in' | 'hold' | 'out'
  const [isComplete, setIsComplete] = useState(false);

  /* ─────────────────────────────────────────────────────────
   *  CANVAS: Matrix Digital Rain
   * ──────────────────────────────────────────────────────── */
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      // Re-init drops on resize
      const fontSize = 16;
      const columns = Math.floor(window.innerWidth / fontSize);
      dropsRef.current = Array.from({ length: columns }, () =>
        Math.random() * -100
      );
    };

    resize();
    window.addEventListener('resize', resize);

    const fontSize = 16;

    /* Fuchsia / pink palette with variation */
    const FUCHSIA_COLORS = [
      '#ff00ff',   // pure fuchsia
      '#ff33cc',   // hot pink-fuchsia
      '#ff66cc',   // soft pink
      '#ff0099',   // deep magenta
      '#ff44aa',   // rose fuchsia
      '#cc00ff',   // purple-fuchsia
      '#ff77dd',   // light fuchsia
      '#ee11bb',   // vivid pink
    ];

    const draw = () => {
      // Semi-transparent black overlay for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      const drops = dropsRef.current;
      const columns = Math.floor(window.innerWidth / fontSize);

      // Ensure drops array matches columns
      while (drops.length < columns) drops.push(Math.random() * -50);
      if (drops.length > columns) drops.length = columns;

      for (let i = 0; i < drops.length; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head of the column: bright white-fuchsia
        if (Math.random() > 0.4) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ff00ff';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = FUCHSIA_COLORS[Math.floor(Math.random() * FUCHSIA_COLORS.length)];
          ctx.shadowColor = '#ff00ff';
          ctx.shadowBlur = 6;
        }

        ctx.font = `${fontSize}px 'Courier New', monospace`;
        ctx.fillText(char, x, y);

        // Reset shadow for performance
        ctx.shadowBlur = 0;

        // Reset drop when it goes off screen (with randomness)
        if (y > window.innerHeight && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.6 + Math.random() * 0.4;
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  /* ── Start canvas on mount ────────────────────────────────── */
  useEffect(() => {
    const cleanup = initCanvas();
    return cleanup;
  }, [initCanvas]);

  /* ─────────────────────────────────────────────────────────
   *  SEQUENCE: Countdown → Words → Done
   * ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'countdown') return;

    let idx = 0;
    const timers = [];

    const showNext = () => {
      if (idx < COUNTDOWN.length) {
        setCountdownVal(COUNTDOWN[idx]);
        setCountdownVisible(true);

        // Blink out before next
        const blinkTimer = setTimeout(() => {
          setCountdownVisible(false);
        }, COUNTDOWN_INTERVAL_MS - 200);
        timers.push(blinkTimer);

        idx++;
        const nextTimer = setTimeout(showNext, COUNTDOWN_INTERVAL_MS);
        timers.push(nextTimer);
      } else {
        // Countdown finished → move to words
        setCountdownVal(null);
        setPhase('words');
      }
    };

    // Small initial delay before starting
    const startTimer = setTimeout(showNext, 600);
    timers.push(startTimer);

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  /* ── Word sequence ─────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'words') return;

    let wordIdx = 0;
    const timers = [];

    const showWord = () => {
      if (wordIdx < WORDS.length) {
        const word = WORDS[wordIdx];
        const isLast = wordIdx === WORDS.length - 1;

        setCurrentWord(word);
        setWordAnim('in');

        // Hold
        const holdTimer = setTimeout(() => {
          setWordAnim('hold');
        }, WORD_FADE_IN_MS);
        timers.push(holdTimer);

        if (!isLast) {
          // Fade out then show next
          const outTimer = setTimeout(() => {
            setWordAnim('out');
          }, WORD_FADE_IN_MS + WORD_HOLD_MS);
          timers.push(outTimer);

          wordIdx++;
          const nextTimer = setTimeout(showWord, WORD_TOTAL_MS);
          timers.push(nextTimer);
        } else {
          // Last word: hold longer then mark complete
          const doneTimer = setTimeout(() => {
            setIsComplete(true);
            setPhase('done');
            if (onComplete) onComplete();
          }, WORD_FADE_IN_MS + FINAL_HOLD_MS);
          timers.push(doneTimer);
        }
      }
    };

    const startTimer = setTimeout(showWord, 300);
    timers.push(startTimer);

    return () => timers.forEach(clearTimeout);
  }, [phase, onComplete]);

  /* ─────────────────────────────────────────────────────────
   *  RENDER
   * ──────────────────────────────────────────────────────── */
  return (
    <section
      className={`section intro ${isComplete ? 'intro--complete' : ''}`}
      id="intro"
    >
      {/* Matrix Rain Canvas */}
      <canvas
        ref={canvasRef}
        className="intro__canvas"
        aria-hidden="true"
      />

      {/* Dark overlay for readability */}
      <div className="intro__overlay" aria-hidden="true" />

      {/* Center display */}
      <div className="intro__center" aria-live="polite">
        {/* Countdown: 3 → 2 → 1 */}
        {phase === 'countdown' && countdownVal && (
          <span
            className={`intro__countdown ${countdownVisible ? 'intro__countdown--visible' : ''}`}
            key={countdownVal}
          >
            {countdownVal}
          </span>
        )}

        {/* Word sequence */}
        {phase === 'words' && currentWord && (
          <span
            className={`intro__word intro__word--${wordAnim} ${
              currentWord === 'HERMANA' ? 'intro__word--name' : ''
            }`}
            key={currentWord}
          >
            {currentWord}
          </span>
        )}

        {/* Final state (after Ale) */}
        {phase === 'done' && (
          <div className="intro__final">
            <span className="intro__word intro__word--in intro__word--name">
              HERMANA
            </span>
            <span className="intro__final-emoji">💖</span>
          </div>
        )}
      </div>

      {/* Bottom hint when complete */}
      {isComplete && (
        <div className="intro__scroll-hint" aria-hidden="true">
          <span>Desliza hacia abajo</span>
          <div className="intro__scroll-arrow" />
        </div>
      )}
    </section>
  );
}

export default Countdown;
