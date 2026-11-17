import type { AssistantAppearance } from '@erxes/core-contract';
import { TAU } from './math';
import {
  SAMPLES,
  filled,
  hullOfCircles,
  profileFromPolygon,
  regularPolygonProfile,
  superellipseProfile,
  unionOfCirclesProfile,
} from './outline';

export type AvatarBody = AssistantAppearance['body'];

export type AvatarColor = AssistantAppearance['color'];

const normalize = (radii: number[], max = 1) => {
  const peak = Math.max(...radii);

  return peak <= 0 ? radii : radii.map((r) => (r * max) / peak);
};

const pebble = normalize(
  Array.from({ length: SAMPLES }, (_, i) => {
    const a = (i / SAMPLES) * TAU;

    return 1 + 0.075 * Math.cos(2 * a + 0.5) + 0.035 * Math.cos(3 * a + 2.1);
  }),
  1.02,
);

const cloud = normalize(
  unionOfCirclesProfile([
    { x: -0.44, y: 0.2, r: 0.54 },
    { x: 0.46, y: 0.2, r: 0.5 },
    { x: 0.02, y: 0.3, r: 0.6 },
    { x: -0.24, y: -0.3, r: 0.48 },
    { x: 0.3, y: -0.24, r: 0.44 },
  ]),
  1.02,
);

export const BODIES: Record<AvatarBody, number[]> = {
  circle: filled(1),
  pebble,
  squircle: normalize(superellipseProfile(4.2), 1.15),
  capsule: profileFromPolygon(
    hullOfCircles({ x: -0.42, y: 0, r: 0.62 }, { x: 0.42, y: 0, r: 0.62 }),
  ),
  triangle: regularPolygonProfile(3, 1.12, 0.34, -90),
  hexagon: regularPolygonProfile(6, 1.04, 0.26, 0),
  cloud,
  drop: normalize(
    profileFromPolygon(hullOfCircles({ x: 0, y: 0.28, r: 0.66 }, { x: 0, y: -0.96, r: 0.05 })),
    1.04,
  ),
};

export const COLORS: Record<AvatarColor, string> = {
  ink: 'var(--color-foreground)',
  brown: '#8b5e3c',
  red: '#e8483f',
  orange: '#f08a24',
  amber: '#f0b429',
  green: '#3ecf8e',
  teal: '#2fbfa0',
  blue: '#3b93f0',
  violet: '#8b5cf6',
  pink: '#e152b0',
  grey: '#a3a3a3',
};
