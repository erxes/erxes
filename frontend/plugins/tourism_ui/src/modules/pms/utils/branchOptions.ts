import {
  IPmsPaymentType,
  IPmsPipelineConfig,
  IPmsUiOptions,
} from '@/pms/types/branch';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readString = (value: unknown) =>
  typeof value === 'string' ? value : undefined;

export const toPmsUiOptions = (value: unknown): IPmsUiOptions => {
  if (!isRecord(value)) return {};

  return {
    logo: readString(value.logo),
    website: readString(value.website),
    colors: isRecord(value.colors)
      ? {
          primary: readString(value.colors.primary),
          secondary: readString(value.colors.secondary),
          third: readString(value.colors.third),
        }
      : undefined,
  };
};

export const toPmsPipelineConfig = (
  value: unknown,
): Partial<IPmsPipelineConfig> => {
  if (!isRecord(value)) return {};

  return {
    boardId: readString(value.boardId),
    pipelineId: readString(value.pipelineId),
    stageId: readString(value.stageId),
  };
};

/**
 * Reads a `paymentTypes` or `discount` JSON value as the entries this UI saved.
 * Every entry is kept: the branch form writes the whole array back, so a
 * dropped entry would be deleted.
 */
export const toPmsPaymentTypes = (value: unknown): IPmsPaymentType[] =>
  Array.isArray(value) ? (value as IPmsPaymentType[]) : [];
