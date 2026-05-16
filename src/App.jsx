import { useState, useCallback } from 'react';
import './App.css';
import Countdown from './components/Countdown/Countdown';
import InteractiveMessage from './components/InteractiveMessage/InteractiveMessage';
import CardSequence from './components/CardSequence/CardSequence';

/**
 * App — Contenedor Principal
 *
 * Aplicación de felicitación de cumpleaños para Ale.
 * Diseño mobile-first, pantalla completa, fondo oscuro con estrellas.
 *
 * Gestiona transiciones secuenciales entre tres secciones:
 *   1. Cuenta Regresiva     → (onComplete) →
 *   2. Mensaje Interactivo  → (onReady / click del botón) →
 *   3. Secuencia de Cartas con Frases
 *
 * Solo la sección activa se renderiza. Las transiciones usan
 * animaciones CSS de opacidad/transform activadas por cambios de estado.
 */
function App() {
  // Estado de la sección activa: 'countdown' → 'message' → 'cards'
  const [activeSection, setActiveSection] = useState('countdown');

  /** La cuenta regresiva terminó → mostrar mensaje interactivo */
  const handleCountdownComplete = useCallback(() => {
    setActiveSection('message');
  }, []);

  /** El usuario hizo clic en "Lista" → mostrar secuencia de cartas */
  const handleMessageReady = useCallback(() => {
    setActiveSection('cards');
  }, []);

  return (
    <div className="app" id="app-container">
      {/* ── Fondo: Campo de estrellas + Resplandor ambiental ── */}
      {/* Se ocultan durante la cuenta regresiva (que tiene su propio fondo Matrix) */}
      <div
        className={`app__starfield ${activeSection !== 'countdown' ? 'app__starfield--visible' : ''}`}
        aria-hidden="true"
      />
      <div
        className={`app__glow ${activeSection !== 'countdown' ? 'app__glow--visible' : ''}`}
        aria-hidden="true"
      />

      {/* ── Contenido Principal ── */}
      <main className="app__content">
        {/* Sección 1: Cuenta Regresiva */}
        {activeSection === 'countdown' && (
          <div className="app__section app__section--active">
            <Countdown onComplete={handleCountdownComplete} />
          </div>
        )}

        {/* Sección 2: Mensaje Interactivo */}
        {activeSection === 'message' && (
          <div className="app__section app__section--active">
            <InteractiveMessage onReady={handleMessageReady} />
          </div>
        )}

        {/* Sección 3: Secuencia de Cartas con Frases */}
        {activeSection === 'cards' && (
          <div className="app__section app__section--active">
            <CardSequence />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
