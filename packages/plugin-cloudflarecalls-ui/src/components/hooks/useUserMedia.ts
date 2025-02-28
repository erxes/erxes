import { useEffect, useState } from 'react';
import { useUnmount } from 'react-use';
import invariant from 'tiny-invariant';

import { getUserMediaExtended } from '../utils/getUserMedia';
import keyInObject from '../utils/keyInObject';

export const errorMessageMap = {
  NotAllowedError:
    'Permission was denied. Grant permission and reload to enable.',
  NotFoundError: 'No device was found.',
  NotReadableError: 'Device is already in use.',
  OverconstrainedError: 'No device was found that meets constraints',
};

export default function useUserMedia() {
  const [audioStreamTrack, setAudioStreamTrack] = useState<MediaStreamTrack>();
  const [mutedAudioStreamTrack, setMutedAudioStreamTrack] =
    useState<MediaStreamTrack>();
  const [audioEnabled, setAudioEnabled] = useState(true);

  const turnMicOff = () => {
    setAudioEnabled(false);
  };

  const turnMicOn = async () => {
    setAudioEnabled(true);
  };

  useEffect(() => {
    let mounted = true;
    getUserMediaExtended({
      audio: true,
    })
      .then(async (ms: any) => {
        if (!mounted) {
          ms.getTracks().forEach((t: any) => t.stop());
          return;
        }
        const audio = ms.getAudioTracks()[0];

        const audioTrack = audio;

        setAudioStreamTrack((prevAudio) => {
          // release previous audio input device if
          // there was one
          if (prevAudio) prevAudio.stop();
          return audioTrack;
        });
      })
      .catch((e: Error) => {
        if (!mounted) return;
        setAudioEnabled(false);
        invariant(keyInObject(errorMessageMap, e.name));
      });

    getUserMediaExtended({
      audio: true,
    }).then((ms: any) => {
      if (!mounted) {
        ms.getTracks().forEach((t: any) => t.stop());
        return;
      }
      const [mutedTrack] = ms.getAudioTracks();
      mutedTrack.enabled = false;
      setMutedAudioStreamTrack(mutedTrack);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useUnmount(() => {
    audioStreamTrack?.stop();
    mutedAudioStreamTrack?.stop();
  });

  return {
    turnMicOn,
    turnMicOff,
    audioStreamTrack: audioStreamTrack,
    audioMonitorStreamTrack: audioStreamTrack,
    audioEnabled,
  };
}

export type UserMedia = ReturnType<typeof useUserMedia>;
