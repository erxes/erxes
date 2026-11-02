import { isRecord } from '@/shared/utils/isRecord';

export function getConditionsFieldErrors(
  fieldState: unknown,
): Record<string, string> {
  if (!isRecord(fieldState) || !Array.isArray(fieldState.error)) return {};

  const errors: Record<string, string> = {};

  for (const errorItem of fieldState.error) {
    if (!isRecord(errorItem)) continue;

    for (const [field, error] of Object.entries(errorItem)) {
      if (isRecord(error) && typeof error.message === 'string') {
        let fieldName = field;
        if (field === 'persistentMenuIds') fieldName = 'persistentMenu';
        if (field === 'conditions') fieldName = 'direct';
        errors[fieldName] = error.message;
      }
    }
  }

  return errors;
}
