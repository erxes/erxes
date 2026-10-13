import { NAVIGATION_EASE_CSS } from '@/navigation/constants/navigationMotion';
import { RefObject, useLayoutEffect, useRef } from 'react';

export const PAGE_ENTER_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: 'translateY(6px)' },
  { opacity: 1, transform: 'none' },
];

export const CONTEXT_ENTER_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: 'translateX(-8px)' },
  { opacity: 1, transform: 'none' },
];

export const getSectionKey = (pathname: string) =>
  pathname.split('/').filter(Boolean).slice(0, 2).join('/');

export const useEnterAnimation = (
  ref: RefObject<HTMLElement | null>,
  key: string,
  keyframes: Keyframe[],
  duration = 220,
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
