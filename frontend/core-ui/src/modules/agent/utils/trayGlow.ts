/**
 * Pure mapping: what the tray bot is doing -> the halo it wears. The
 * glow is a status signal, not decoration, so it mirrors the director's
 * attention rules one-to-one; `null` means "quiet".
 *
 * Rendering note: `animation` maps 1:1 onto the `@keyframes tray-glow-*`
 * entries in core-ui's styles.css; `durationMs` is the cycle length.
 * `opacity` is the halo's ceiling — themes dim it for light pages where
 * a strong halo looks dirty.
 */
import type { StateId } from '../bloub/engine/states';
import { NOTIF_BLUE } from '../bloub/engine/decor';

export type TrayGlowAnimation = 'pulse' | 'flash' | 'twice' | 'steady';

export interface ITrayGlow {
  color: string;
  animation: TrayGlowAnimation;
  /** Cycle length in ms; 0 for `steady`. */
  durationMs: number;
  /** Halo ceiling 0..1 (already theme-adjusted). */
  opacity: number;
}

export interface ITrayGlowInput {
  /** Director-chosen state currently shown. */
  state: StateId;
  dragging: boolean;
  hovering: boolean;
  /** Resolved theme — glows sit softer on light pages. */
  dark: boolean;
  /** The bot's own ink colour, for the faint hover halo. */
  botColor: string;
}

const GLOW_AMBER = '#f0b429';
const GLOW_VIOLET = '#8b5cf6';
const GLOW_RED = '#e8483f';
const GLOW_WHITE = '#f8fafc';
/** Neutral lift while the tray is being carried. */
const GLOW_NEUTRAL = '#9aa4b2';

const dim = (dark: boolean, strong: number, soft: number): number =>
  dark ? strong : soft;

export const trayGlow = (input: ITrayGlowInput): ITrayGlow | null => {
  const { state, dragging, hovering, dark, botColor } = input;

  if (dragging) {
    return {
      color: GLOW_NEUTRAL,
      animation: 'steady',
      durationMs: 0,
      opacity: dim(dark, 0.9, 0.6),
    };
  }

  switch (state) {
    case 'alert': // needs a decision — amber pulse
      return {
        color: GLOW_AMBER,
        animation: 'pulse',
        durationMs: 1200,
        opacity: dim(dark, 0.8, 0.55),
      };
    case 'notify': // unread — blue, matching the pastille
      return {
        color: NOTIF_BLUE,
        animation: 'pulse',
        durationMs: 2000,
        opacity: dim(dark, 0.75, 0.5),
      };
    case 'thinking':
    case 'orbit': // busy — violet breathing
      return {
        color: GLOW_VIOLET,
        animation: 'pulse',
        durationMs: 1600,
        opacity: dim(dark, 0.7, 0.5),
      };
    case 'exclaim': // error — two quick pulses then gone
      return {
        color: GLOW_RED,
        animation: 'twice',
        durationMs: 900,
        opacity: dim(dark, 0.85, 0.6),
      };
    case 'comet': // just finished — one bright flash
      return {
        color: GLOW_WHITE,
        animation: 'flash',
        durationMs: 1000,
        opacity: dim(dark, 0.9, 0.7),
      };
    default:
      break;
  }

  if (hovering) {
    return {
      color: botColor,
      animation: 'steady',
      durationMs: 0,
      opacity: dim(dark, 0.3, 0.18),
    };
  }

  return null;
};
