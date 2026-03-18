import { useRef, useCallback } from 'react';
import notifySrc from '../assets/notification.mp3';

export const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(notifySrc);
        audioRef.current.volume = 0.5;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // autoplay may be blocked before user interaction — silently ignore
      });
    } catch {
      // ignore errors in environments without audio support
    }
  }, []);

  return { play };
};
