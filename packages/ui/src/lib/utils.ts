import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** A number, or text with thousands commas, rounded to `p` decimals; not a number reads as 0. */
export function fixNum(value: number | string | null | undefined, p = 4) {
  const cleanNumber = Number(String(value ?? '').replace(/,/g, ''));

  if (Number.isNaN(cleanNumber)) {
    return 0;
  }

  const multiplier = 10 ** p;
  const big = Math.round(Number((cleanNumber * multiplier).toFixed(2)));

  return Number((big / multiplier).toFixed(p));
}

/** `value` rounded and shown with exactly `p` decimals and thousands commas. */
export function displayNum(value: number | string | null | undefined, p = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: p,
    maximumFractionDigits: p,
  }).format(fixNum(value, p));
}
