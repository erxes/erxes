import type { Look } from './frame';
import { clamp, easeOutQuint } from './math';

const YAW_MAX = 16;
const PITCH_MAX = 13;
const PITCH = 10;

export const TURN_TIME = 1.1;

export interface Aim {
  pointer: { x: number; y: number } | null;
  box: { left: number; top: number; width: number; height: number };
  viewport: { width: number; height: number };
  turning: number;
}

export const lookTarget = ({ pointer, box, viewport, turning }: Aim): Look => {
  const nx = pointer
    ? clamp((pointer.x - (box.left + box.width / 2)) / Math.max(1, viewport.width / 2), -1, 1)
    : 0;

  const ny = pointer
    ? clamp((pointer.y - (box.top + box.height / 2)) / Math.max(1, viewport.height / 2), -1, 1)
    : 0;

  return {
    yaw: nx * YAW_MAX,
    pitch: PITCH - ny * PITCH_MAX,
    mix: easeOutQuint(clamp(turning / TURN_TIME)),
    wander: pointer ? 0 : 1,
  };
};
