export type RepairResult =
  | { failed: false }
  | { failed: true; message?: string };

export const parseRepairResult = (result: unknown): RepairResult => {
  if (typeof result !== 'object' || result === null) {
    return { failed: false };
  }

  if (!('status' in result) || result.status !== 'error') {
    return { failed: false };
  }

  const message =
    'errorMessage' in result && typeof result.errorMessage === 'string'
      ? result.errorMessage
      : undefined;

  return { failed: true, message };
};
