// Hook React pour détecter si l'écran est en mode mobile (largeur <= breakpoint).
// Utilisé pour adapter l'affichage (ex: masquer la sidebar, réduire les paddings).
import { useState, useEffect } from 'react';

export default function useIsMobile(breakpoint = 768) {
  // Initialisation synchrone pour éviter un flash entre le rendu initial et le premier effect
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handler);
    // Nettoyage de l'écouteur à la destruction du composant pour éviter les fuites mémoire
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}
