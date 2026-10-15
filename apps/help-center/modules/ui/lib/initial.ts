const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;

export const initialOf = (text: string, fallback = ''): string => {
  const trimmed = text.trim();
  const letter = trimmed.match(LETTER_OR_DIGIT)?.[0];

  return (letter ?? Array.from(trimmed)[0] ?? fallback).toUpperCase();
};
