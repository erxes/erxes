import { z } from 'zod';

const HELP_CENTER_URL_SCHEMA = z
  .string()
  .url()
  .refine((value) => {
    try {
      const { protocol } = new URL(value);
      return protocol === 'http:' || protocol === 'https:';
    } catch {
      return false;
    }
  });

export const isValidHelpCenterUrl = (value: string) =>
  HELP_CENTER_URL_SCHEMA.safeParse(value).success;

export const getHelpCenterUrlError = (value?: string) => {
  const trimmed = value?.trim() ?? '';

  if (!trimmed) {
    return undefined;
  }

  return isValidHelpCenterUrl(trimmed) ? undefined : 'kb-website-invalid';
};
