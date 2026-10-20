import { NAVIGATION_EASE_CSS } from '@/navigation/constants/navigationMotion';
import { RefObject, useLayoutEffect, useRef } from 'react';

// Fade only: the area below the top bar includes the app's own sidebar, so
// sliding it reads as a jump.
export const PAGE_ENTER_KEYFRAMES: Keyframe[] = [
  { opacity: 0.4 },
  { opacity: 1 },
];

/** The open app (plugin or core module); page changes inside it animate in AppLayout. */
export const getAppKey = (pathname: string) =>
  pathname.split('/').filter(Boolean)[0] || '';

export const useEnterAnimation = (
  ref: RefObject<HTMLElement | null>,
  key: string,
  keyframes: Keyframe[],
  duration = 160,
) => {
  const previousKey = useRef(key);
  const animation = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    if (previousKey.current === key) {
      return;
    }

    previousKey.current = key;

    const element = ref.current;

    if (
      !element?.animate ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    animation.current?.cancel();
    animation.current = element.animate(keyframes, {
      duration,
      easing: NAVIGATION_EASE_CSS,
    });
  }, [duration, key, keyframes, ref]);
};
