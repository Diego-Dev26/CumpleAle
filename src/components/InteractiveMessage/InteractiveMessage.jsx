import { useState, useMemo, useEffect } from 'react';
import './InteractiveMessage.css';

/* ── Musical note positions for floating animation ──────────── */
const NOTES = ['♪', '♫', '♬', '🎵', '🎶', '♩'];

/**
 * InteractiveMessage — Sección 2: Mensaje Interactivo
 *
 * Fondo de campo de estrellas profundo con:
 * - Gato animado tocando guitarra (alternancia de frames CSS)
 * - Título "HAPPY BIRTHDAY" arriba
 * - Bloque de mensaje interactivo: "¡Hola!", "¿Lista para abrir tu regalo?", [Lista]
 * - Click del botón dispara onReady → oculta sección, muestra cartas
 *
 * @param {Object} props
 * @param {() => void} props.onReady — se llama cuando el usuario hace clic en "Lista"
 */
function InteractiveMessage({ onReady }) {
  const [catFrame, setCatFrame] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  /* ── Cat strumming animation: alternate frames ───────────── */
  useEffect(() => {
    const interval = setInterval(() => {
      setCatFrame((prev) => (prev + 1) % 2);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  /* ── Floating musical notes ──────────────────────────────── */
  const musicNotes = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      note: NOTES[Math.floor(Math.random() * NOTES.length)],
      left: `${10 + Math.random() * 80}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${Math.random() * 4 + 4}s`,
      size: `${Math.random() * 0.8 + 0.8}rem`,
    }));
  }, []);

  /* ── Twinkling stars for this section ────────────────────── */
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`,
      brightness: Math.random() * 0.6 + 0.4,
    }));
  }, []);

  /* ── Button click handler ────────────────────────────────── */
  const handleReady = () => {
    setIsExiting(true);
    // Let the exit animation play, then notify parent
    setTimeout(() => {
      if (onReady) onReady();
    }, 800);
  };

  return (
    <section
      className={`section cat-section ${isExiting ? 'cat-section--exit' : ''}`}
      id="cat-message"
    >
      {/* ── Deep Starfield Background ── */}
      <div className="cat-section__stars" aria-hidden="true">
        {stars.map((star) => (
          <span
            key={star.id}
            className="cat-section__star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.duration,
              opacity: star.brightness,
            }}
          />
        ))}
      </div>

      {/* ── Floating Musical Notes ── */}
      <div className="cat-section__notes" aria-hidden="true">
        {musicNotes.map((n) => (
          <span
            key={n.id}
            className="cat-section__note"
            style={{
              left: n.left,
              animationDelay: n.delay,
              animationDuration: n.duration,
              fontSize: n.size,
            }}
          >
            {n.note}
          </span>
        ))}
      </div>

      {/* ── Main Content Container ── */}
      <div className="cat-section__content">
        {/* FELIZ CUMPLEAÑOS Title */}
        <h2 className="cat-section__title" id="happy-birthday-title">
          <span className="cat-section__title-line">FELIZ</span>
          <span className="cat-section__title-line cat-section__title-line--accent">
            CUMPLEAÑOS
          </span>
        </h2>

        {/* ── Cat with Guitar Animation ── */}
        <div className="cat-section__cat-container">
          <div className="cat-section__cat" aria-label="Gato tocando guitarra">
            {/* Cat face — alternates expression with strumming */}
            <div className={`cat-section__cat-face cat-section__cat-face--frame${catFrame}`}>
              <div className="cat-section__cat-ears">
                <span className="cat-section__cat-ear cat-section__cat-ear--left" />
                <span className="cat-section__cat-ear cat-section__cat-ear--right" />
              </div>
              <div className="cat-section__cat-head">
                <div className="cat-section__cat-eyes">
                  <span className="cat-section__cat-eye" />
                  <span className="cat-section__cat-eye" />
                </div>
                <div className="cat-section__cat-mouth">
                  {catFrame === 0 ? '◡' : '○'}
                </div>
                <div className="cat-section__cat-whiskers">
                  <div className="cat-section__cat-whisker-group cat-section__cat-whisker-group--left">
                    <span /><span /><span />
                  </div>
                  <div className="cat-section__cat-whisker-group cat-section__cat-whisker-group--right">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            </div>
            {/* Guitar */}
            <div className={`cat-section__guitar cat-section__guitar--frame${catFrame}`}>
              🎸
            </div>
          </div>

          {/* Glow behind cat */}
          <div className="cat-section__cat-glow" aria-hidden="true" />
        </div>

        {/* ── Interactive Message Block ── */}
        <div className="cat-section__message glass-card" id="cat-message-block">
          <p className="cat-section__message-greeting">¡Hola hermanita! 👋</p>
          <p className="cat-section__message-question">
            ¿Lista para leer tu regalo?
          </p>
          <button
            className="cat-section__btn"
            id="ready-btn"
            type="button"
            onClick={handleReady}
            disabled={isExiting}
          >
            <span className="cat-section__btn-text">¡Estoy lista!</span>
            <span className="cat-section__btn-icon" aria-hidden="true">🎁</span>
            <span className="cat-section__btn-shine" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default InteractiveMessage;
