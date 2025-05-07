import { useEffect, useState } from 'react';

import keepTrying from '../utils/keepTrying';
import Peer from '../utils/peerClient';

export default function usePushedTrack(
  peer: Peer,
  mediaStreamTrack?: MediaStreamTrack,
  {
    priority,
    maxBitrate,
    maxFramerate,
    scaleResolutionDownBy,
  }: RTCRtpEncodingParameters = {},
) {
  const [transceiverId, setTransceiverId] = useState<string>();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (pending || !mediaStreamTrack) return;
    // important that we don't call pushTrack more
    // than once here so we'll set state. If the media
    // stream changes while this is pending we'll replace
    // it once it is done
    if (transceiverId === undefined) {
      setPending(true);
      keepTrying(() =>
        peer
          .pushTrack(mediaStreamTrack.id, mediaStreamTrack)
          .then((trackObject) => {
            // backwards compatibility: trackObject -> ResourceID
            let resourceID = `${trackObject.sessionId}/${trackObject.trackName}`;
            setTransceiverId(resourceID);
            setPending(false);
          }),
      );
    } else {
      peer.replaceTrack(transceiverId, mediaStreamTrack);
    }
  }, [mediaStreamTrack, peer, pending, transceiverId]);

  useEffect(() => {
    if (!mediaStreamTrack || !transceiverId || !peer) {
      return;
    }

    const encodings = [
      { maxBitrate, maxFramerate, priority, scaleResolutionDownBy },
    ];

    peer.configureSender(transceiverId, mediaStreamTrack, {
      encodings,
    });
  }, [
    maxBitrate,
    maxFramerate,
    mediaStreamTrack,
    peer,
    priority,
    scaleResolutionDownBy,
    transceiverId,
  ]);

  // TODO: need to sort out how to close this when unmounting

  return transceiverId;
}
