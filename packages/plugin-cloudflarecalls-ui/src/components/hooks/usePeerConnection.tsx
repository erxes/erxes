import { useEffect, useRef, useState } from 'react';

import Peer from '../utils/peerClient';
import Configs from '../../containers/Configs';

export const usePeerConnection = (config: { iceServers?: RTCIceServer[] }) => {
  const peerRef = useRef<Peer>();

  const configs = Configs();

  const [iceConnectionState, setIceConnectionState] =
    useState<RTCIceConnectionState>('new');

  useEffect(() => {
    if (!peerRef.current && configs !== null) {
      const p = new Peer({ ...config, ...configs });
      peerRef.current = p;

      const iceConnectionStateChangeHandler = () => {
        setIceConnectionState(p.pc.iceConnectionState);
      };
      p.pc.addEventListener(
        'iceconnectionstatechange',
        iceConnectionStateChangeHandler,
      );
      return () => {
        p.pc.removeEventListener(
          'connectionstatechange',
          iceConnectionStateChangeHandler,
        );
      };
    }
  }, [config, configs]);

  return { peer: peerRef.current, iceConnectionState };
};
