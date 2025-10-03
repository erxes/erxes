import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getShortName = (name: string) => {
  if (name === 'Trade and Development bank') return 'TDB';
  if (name === 'National investment bank') return 'NIB';
  if (name === 'Chinggis khaan bank') return 'CKHB';
  return name;
};