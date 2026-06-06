import { useCallback, useRef } from 'react';
import notifySound from '../../../../assets/sound/notify.mp3';

export const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(notifySound);
        audioRef.current.volume = 0.5;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Handle play error (e.g., user hasn't interacted with the page)
      });
    } catch (error) {
      // Handle error (e.g., audio file not found)
    }
  }, []);

  return { play };
};
