import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { postMessage } from '@libs/utils';
import {
  isMessengerVisibleAtom,
  lastUnreadMessageAtom,
  messengerTabAtom,
  unreadCountAtom,
} from '../states';

export interface IMessengerNotification {
  unreadCount: number;
  isVisible: boolean;
  openMessenger: () => void;
  closeMessenger: () => void;
  toggleMessenger: () => void;
}

// ---------------------------------------------------------------------------
// Notification sound — Web Audio API
// ---------------------------------------------------------------------------

let _audioCtx: AudioContext | null = null;

const getAudioCtx = (): AudioContext | null => {
  if (_audioCtx) return _audioCtx;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    _audioCtx = new AudioCtx();
  } catch {
    // not supported
  }
  return _audioCtx;
};

// Pre-unlock AudioContext on the first user gesture inside the messenger iframe.
// Must be called from a real click/keydown so the browser's autoplay policy
// allows later resume() calls that happen outside a gesture (e.g. from useEffect).
const unlockAudio = () => {
  getAudioCtx()?.resume();
  window.removeEventListener('click', unlockAudio, true);
  window.removeEventListener('keydown', unlockAudio, true);
};
window.addEventListener('click', unlockAudio, true);
window.addEventListener('keydown', unlockAudio, true);

const playNotificationSound = () => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  ctx.resume().then(() => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }).catch(() => {
    // context still locked — no prior user gesture in this iframe
  });
};

/**
 * Tracks unread messages and exposes messenger visibility controls.
 *
 * - Increments `unreadCount` and plays a sound when a new message arrives
 *   and the messenger is closed.
 * - Resets `unreadCount` to 0 when the messenger is opened.
 * - Notifies the parent frame of the current count via postMessage so the
 *   launcher button (rendered outside the iframe) can display a badge.
 */
export const useMessengerNotification = (): IMessengerNotification => {
  const [unreadCount, setUnreadCount] = useAtom(unreadCountAtom);
  const [isVisible, setIsVisible] = useAtom(isMessengerVisibleAtom);
  const lastUnreadMessage = useAtomValue(lastUnreadMessageAtom);
  const activeTab = useAtomValue(messengerTabAtom);

  // Keep a ref to the last processed message id so we only count each
  // message once, even if the atom value is set multiple times.
  const lastProcessedIdRef = useRef<string | null>(null);

  // Increment count when the user is not actively reading the chat:
  // either the messenger is closed, or it's open but on a different tab.
  useEffect(() => {
    if (!lastUnreadMessage) return;
    if (lastUnreadMessage._id === lastProcessedIdRef.current) return;

    lastProcessedIdRef.current = lastUnreadMessage._id;

    if (!isVisible || activeTab !== 'chat') {
      setUnreadCount((prev) => prev + 1);
      // Primary: ask the parent document to play sound — it has real user
      // activation (launcher click propagates up to the top-level frame).
      postMessage('fromMessenger', 'playSound', {});
      // Fallback: play directly if the iframe context happens to be unlocked.
      playNotificationSound();
    }
  }, [lastUnreadMessage, isVisible, activeTab, setUnreadCount]);

  // Reset count only when the user is actively on the chat tab.
  useEffect(() => {
    if (isVisible && activeTab === 'chat') {
      setUnreadCount(0);
    }
  }, [isVisible, activeTab, setUnreadCount]);

  // Keep the parent launcher badge in sync whenever the count changes.
  useEffect(() => {
    postMessage('fromMessenger', 'unreadCount', { unreadCount });
  }, [unreadCount]);

  const openMessenger = () => setIsVisible(true);
  const closeMessenger = () => setIsVisible(false);
  const toggleMessenger = () => setIsVisible((prev) => !prev);

  return { unreadCount, isVisible, openMessenger, closeMessenger, toggleMessenger };
};
