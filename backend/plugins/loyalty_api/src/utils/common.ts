import { randomBytes } from 'node:crypto';

export const randomBetween = (min: number, max: number) => {
  const rand = randomBytes(4).readUInt32BE(0) / 0xffffffff;
  return rand * (max - min) + min;
};
