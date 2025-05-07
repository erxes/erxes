import * as React from "react";
import { useEffect, useRef, useState, type FC } from "react";

interface AudioStreamProps {
  mediaStreamTrack: MediaStreamTrack;
}

export const AudioStream: FC<AudioStreamProps> = ({ mediaStreamTrack }) => {
  const ref = useRef<HTMLAudioElement>(null);
  const [mediaStream] = useState(() => new MediaStream());
  useEffect(() => {
    let previousState = mediaStreamTrack.readyState;

    const interval = setInterval(() => {
      if (mediaStreamTrack.readyState !== previousState) {
        previousState = mediaStreamTrack.readyState;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [mediaStreamTrack]);

  useEffect(() => {
    mediaStream.addTrack(mediaStreamTrack);

    const audio = ref.current;
    if (audio) {
      if (audio.srcObject !== mediaStream) {
        audio.srcObject = mediaStream;
      }
      audio.play().catch((error) => console.error("Autoplay error:", error));
    }

    return () => {
      mediaStream.removeTrack(mediaStreamTrack);
    };
  }, [mediaStreamTrack, mediaStream, ref]);

  return <audio ref={ref} autoPlay controls style={{ display: "none" }} />;
};
