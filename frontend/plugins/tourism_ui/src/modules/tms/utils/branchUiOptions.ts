import { IBranchUiOptions } from '@/tms/types/branch';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readString = (value: unknown) =>
  typeof value === 'string' ? value : undefined;

export const toBranchUiOptions = (value: unknown): IBranchUiOptions => {
  if (!isRecord(value)) return {};

  return {
    logo: readString(value.logo),
    favIcon: readString(value.favIcon),
    mainLogo: readString(value.mainLogo),
    colors: isRecord(value.colors)
      ? { primary: readString(value.colors.primary) }
      : undefined,
  };
};
