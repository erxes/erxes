import { type RefObject, useEffect, useEffectEvent, useRef } from 'react';

const MAX_STEP = 0.064;
const FRAME_MS = 34;

export const useFrameLoop = (
  target: RefObject<Element | null>,
  onFrame: (seconds: number) => void,
) => {
  const clock = useRef(0);
  const frame = useEffectEvent(onFrame);

  useEffect(() => {
    const element = target.current;
    let handle = 0;
    let last = 0;
    let committed = 0;
    let onScreen = true;

    const stop = () => {
      cancelAnimationFrame(handle);
      handle = 0;
      last = 0;
    };

    const tick = (ms: number) => {
      handle = 0;
      clock.current += last ? Math.min((ms - last) / 1000, MAX_STEP) : 0;
      last = ms;

      if (ms - committed >= FRAME_MS) {
        committed = ms;
        frame(clock.current);
      }

      start();
    };

    const start = () => {
      if (handle === 0 && onScreen && !document.hidden) handle = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;

      if (onScreen) start();
      else stop();
    });

    const onVisibility = () => (document.hidden ? stop() : start());

    if (element) observer.observe(element);
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [target]);

  return clock;
};

export const usePointer = (enabled: boolean) => {
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') pointer.current = { x: event.clientX, y: event.clientY };
    };

    const onLeave = () => {
      pointer.current = null;
    };

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      pointer.current = null;
    };
  }, [enabled]);

  return pointer;
};
