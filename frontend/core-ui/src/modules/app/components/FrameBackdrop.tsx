import { cn } from 'erxes-ui';
import { CSSProperties } from 'react';
import { FrameStyle, frameFillVars } from '@/app/constants/appearance';

const PARTICLE_COUNT = 18;
const AURORA_GLOWS = [
  'frame-glow-violet',
  'frame-glow-cyan',
  'frame-glow-pink',
];

// Spread by index, not Math.random, so particles keep their place on re-render.
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
  left: (index * 53) % 100,
  delay: -((index * 1.7) % 14),
  duration: 11 + ((index * 7) % 9),
  size: index % 3,
}));

/**
 * The colored frame behind framed layouts. It sits under the navigation and
 * the app card, so effects only show in the frame; motion stays CSS-only and
 * is off under prefers-reduced-motion (see styles.css).
 */
export const FrameBackdrop = ({ frame }: { frame: FrameStyle }) => (
  <div
    aria-hidden
    className="frame-fill pointer-events-none absolute inset-0 overflow-hidden"
    style={frameFillVars(frame)}
  >
    {frame.effect === 'aurora' &&
      AURORA_GLOWS.map((glow) => (
        <span key={glow} className={cn('frame-glow', glow)} />
      ))}
    {(frame.effect === 'snow' || frame.effect === 'petals') &&
      PARTICLES.map((particle, index) => (
        <span
          key={index}
          className={cn(
            'frame-particle',
            frame.effect === 'snow' ? 'frame-snow' : 'frame-petal',
          )}
          style={
            {
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              '--particle-size': `${
                (frame.effect === 'snow' ? 3 : 7) + particle.size * 2
              }px`,
            } as CSSProperties
          }
        />
      ))}
  </div>
);
