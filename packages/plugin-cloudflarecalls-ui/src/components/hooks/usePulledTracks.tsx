import { useEffect, useRef, useState } from 'react';
import { useUnmount } from 'react-use';
import Peer from '../utils/peerClient';
import { useRoomContext } from '../../RoomContext';

function pullTrack(peer: Peer, track: string) {
  const [sessionId, trackName] = track.split('/');
  return peer.pullTrack({
    location: 'remote',
    sessionId,
    trackName,
  });
}

export default function usePulledTracks(
  tracksToPull: string[],
): Record<string, MediaStreamTrack> {
  const { peer } = useRoomContext();
  // using useState here because we want React to re-render here
  // when there is a change
  const [pulledTrackRecord, setPulledTrackRecord] = useState<
    Record<string, MediaStreamTrack>
  >({});
  // using useRef here because we don't want React
  // to re-render when these change
  const pendingTracksRef = useRef<Record<string, Promise<MediaStreamTrack>>>(
    {},
  );
  const tracksToPullRef = useRef(tracksToPull);
  tracksToPullRef.current = tracksToPull;
  const mountedRef = useRef(true);
  let unMountedCount = 0;

  useUnmount(() => {
    mountedRef.current = false;
    unMountedCount += 1;
  });

  useEffect(() => {
    if (!peer) return;
    tracksToPull.forEach((track) => {
      const alreadyPulled =
        pulledTrackRecord[track] ||
        pendingTracksRef.current[track] !== undefined;
      if (alreadyPulled) return;
      const pending = pullTrack(peer, track).then((mediaStreamTrack) => {
        if (unMountedCount > 1) return mediaStreamTrack;
        if (tracksToPullRef.current.includes(track)) {
          setPulledTrackRecord((current) => ({
            ...current,
            [track]: mediaStreamTrack,
          }));
          delete pendingTracksRef.current[track];
        } else {
          peer.closeTrack(mediaStreamTrack);
        }
        return mediaStreamTrack;
      });
      pendingTracksRef.current[track] = pending;
    });

    const trackSet = new Set(tracksToPull);
    Object.entries(pulledTrackRecord).forEach(([key, value]) => {
      if (trackSet.has(key)) {
        return;
      }

      peer.closeTrack(value);
      setPulledTrackRecord((current) => {
        const clone = { ...current };
        delete clone[key];
        return clone;
      });
    });
  }, [peer, pulledTrackRecord, tracksToPull]);

  useEffect(() => {
    if (!peer) return;
    const pendingTracks = pendingTracksRef.current;
    return () => {
      if (unMountedCount <= 1) return;
      Object.values(pendingTracks).forEach((promise) => {
        promise.then((t) => peer.closeTrack(t));
      });

      Object.values(pulledTrackRecord).forEach((t) => peer.closeTrack(t));
    };
  }, [peer, pulledTrackRecord]);

  return pulledTrackRecord;
}
