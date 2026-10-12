import { BotRunnerSprite } from '@/error-handler/components/BotRunnerSprite';
import {
  RUNNER_PLAYER_X,
  RUNNER_SLOTS,
  useBotRunner,
} from '@/error-handler/hooks/useBotRunner';

const GROUND = 28;

// Scoped to the runner: poses, the bouncy run cycle and obstacle looks keyed by data attributes.
const RUNNER_STYLES = `
@keyframes runner-bob {
  0%, 100% { transform: translateY(0) rotate(8deg); }
  50% { transform: translateY(-2.5px) rotate(5deg); }
}
/* Planted foot pushes back along the ground, then swings forward through the air. */
@keyframes runner-patter {
  0%, 100% { transform: translate(3px, 0); }
  50% { transform: translate(-3px, 0); }
  75% { transform: translate(0, -3.5px); }
}
@keyframes runner-swing { 0%, 100% { transform: translateX(2px); } 50% { transform: translateX(-2px); } }
@keyframes runner-dust {
  0% { transform: translateX(0) scale(1); opacity: 0.9; }
  100% { transform: translateX(-8px) scale(0.4); opacity: 0; }
}
@keyframes runner-laser { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
.bot-runner .runner-body { transform-box: fill-box; transform-origin: 50% 100%; }
.bot-runner .runner-foot, .bot-runner .runner-hand, .bot-runner .runner-dust circle { transform-box: fill-box; }
.bot-runner[data-pose='run'] .runner-body { animation: runner-bob 0.26s ease-in-out infinite; }
.bot-runner[data-pose='run'] .runner-foot-front { animation: runner-patter 0.26s linear infinite; }
.bot-runner[data-pose='run'] .runner-foot-back { animation: runner-patter 0.26s linear infinite -0.13s; }
.bot-runner[data-pose='run'] .runner-hand-front { animation: runner-swing 0.26s ease-in-out infinite; }
.bot-runner[data-pose='run'] .runner-hand-back { animation: runner-swing 0.26s ease-in-out infinite reverse; }
.bot-runner[data-pose='jump'] .runner-body { transform: rotate(-4deg); }
.bot-runner[data-pose='jump'] .runner-foot { transform: translateY(-3px); }
.bot-runner[data-pose='jump'] .runner-hand { transform: translateY(-5px); }
.bot-runner .runner-slide { display: none; }
.bot-runner[data-pose='slide'] .runner-slide { display: inline; }
.bot-runner[data-pose='slide'] .runner-stand { display: none; }
.bot-runner[data-pose='slide'] .runner-dust circle { animation: runner-dust 0.3s linear infinite; }
.bot-runner[data-pose='slide'] .runner-dust circle:nth-child(2) { animation-delay: -0.1s; }
.bot-runner[data-pose='slide'] .runner-dust circle:nth-child(3) { animation-delay: -0.2s; }
.bot-runner[data-pose='dead'] .runner-eye { fill: #E5484D; }
.runner-slot { display: none; position: absolute; left: 0; }
.runner-slot[data-kind='box'] {
  display: block; bottom: ${GROUND}px; border-radius: 3px;
  background: repeating-linear-gradient(90deg, #8B5A2B 0 5px, #7A4E25 5px 7px);
  border: 2px solid #5C3A1B;
}
.runner-slot[data-kind='hole'] {
  display: block; bottom: 0; height: ${GROUND - 2}px;
  background: linear-gradient(color-mix(in oklab, currentColor 12%, transparent) 10%, transparent);
  clip-path: polygon(0 0, 100% 0, 82% 100%, 18% 100%);
}
.runner-slot[data-kind='laser'] {
  display: block; bottom: ${GROUND + 34}px; height: 6px; border-radius: 3px;
  background: #E5484D; box-shadow: 0 0 8px 2px rgba(229, 72, 77, 0.65);
  animation: runner-laser 0.2s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .bot-runner *, .runner-slot { animation: none !important; }
}
`;

const HINTS = {
  idle: 'Press Space to play',
  over: 'Game over · Space to retry',
  running: '',
};

// Something to do while the backend gets back on its feet.
export const BotRunner = () => {
  const {
    status,
    best,
    jump,
    stageRef,
    groundRef,
    playerRef,
    scoreRef,
    setSlotRef,
  } = useBotRunner();

  return (
    <div className="w-full max-w-2xl px-4">
      <style>{RUNNER_STYLES}</style>
      <div className="flex justify-end gap-4 font-mono text-xs text-muted-foreground tabular-nums">
        <span>HI {best}</span>
        <span ref={scoreRef} className="text-foreground">
          00000
        </span>
      </div>
      <div
        ref={stageRef}
        onPointerDown={jump}
        className="relative h-44 w-full cursor-pointer select-none overflow-hidden touch-none text-foreground"
      >
        <div
          ref={groundRef}
          className="absolute inset-x-0 h-0.5 bg-foreground/25"
          style={{ bottom: GROUND }}
        />
        {Array.from({ length: RUNNER_SLOTS }, (_, index) => (
          <div key={index} ref={setSlotRef(index)} className="runner-slot" />
        ))}
        <div
          ref={playerRef}
          data-pose="idle"
          className="bot-runner absolute"
          style={{ left: RUNNER_PLAYER_X, bottom: GROUND }}
        >
          <BotRunnerSprite />
        </div>
        {status !== 'running' && (
          <p className="absolute inset-x-0 top-6 text-center text-sm text-muted-foreground">
            {HINTS[status]}
          </p>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Space / ↑ jump · ↓ slide · reloads by itself once the backend is back
      </p>
    </div>
  );
};
