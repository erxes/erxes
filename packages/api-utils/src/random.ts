import { customAlphabet } from 'nanoid';

export const randomAlphanumeric = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
);
export const randomLowercase = customAlphabet('abcdefghijklmnopqrstuvwxyz');
