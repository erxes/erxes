import { TAiAgentBotPose } from '@/automations/components/settings/components/agents/constants/aiAgentBotPoses';
import { TAiAgentBotScene } from '@/automations/components/settings/components/agents/utils/aiAgentBotPose';
import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * Plays a scene once and rests on its last frame. A new scene (new key)
 * restarts from the top; reduced motion jumps straight to the end.
 */
export const useAiAgentBotScene = (
  scene: TAiAgentBotScene,
): TAiAgentBotPose => {
  const [frame, setFrame] = useState({ key: scene.key, index: 0 });
  // Frames are rebuilt on every render; only the key decides a restart.
  const framesRef = useRef(scene.frames);
  framesRef.current = scene.frames;

  useEffect(() => {
    const frames = framesRef.current;
    const lastIndex = frames.length - 1;

    if (prefersReducedMotion()) {
      setFrame({ key: scene.key, index: lastIndex });
      return;
    }

    setFrame({ key: scene.key, index: 0 });

    let elapsed = 0;
    const timers = frames.slice(0, lastIndex).map((current, index) => {
      elapsed += current.ms;
      return window.setTimeout(
        () => setFrame({ key: scene.key, index: index + 1 }),
        elapsed,
      );
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [scene.key]);

  const index = frame.key === scene.key ? frame.index : 0;

  return scene.frames[Math.min(index, scene.frames.length - 1)].pose;
};
