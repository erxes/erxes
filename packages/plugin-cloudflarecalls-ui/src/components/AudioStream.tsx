import React, { useEffect, useRef, type FC } from 'react';

interface AudioStreamProps {
  mediaStreamTrack: MediaStreamTrack;
}

export const AudioStream: FC<AudioStreamProps> = ({ mediaStreamTrack }) => {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    const mediaStream = new MediaStream();
    mediaStream.addTrack(mediaStreamTrack);

    audio.srcObject = mediaStream;
    audio
      .play()
      .then()
      .catch((error) => console.error('Autoplay error:', error));

    return () => {
      audio.srcObject = null;
    };
  }, [mediaStreamTrack]);

  return <audio ref={ref} autoPlay controls style={{ display: 'none' }} />;
};
