import { FieldErrors } from 'react-hook-form';
import { TMessageTriggerForm } from '../types/messageTrigger';

const normalizeConditionErrorField = (field: string) => {
  if (field === 'persistentMenuIds') {
    return 'persistentMenu';
  }

  if (field === 'conditions') {
    return 'direct';
  }

  if (field === 'sourceIds') {
    return 'open_thread';
  }

  return field;
};

const getErrorMessage = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return '';
  }

  return typeof error.message === 'string' ? error.message : '';
};

export function getConditionsFieldErrors(
  formErrors: FieldErrors<TMessageTriggerForm>,
): Record<string, string> {
  if (!Array.isArray(formErrors.conditions)) {
    return {};
  }

  const errors: Record<string, string> = {};

  for (const errorItem of formErrors.conditions) {
    if (!errorItem || typeof errorItem !== 'object') {
      continue;
    }

    for (const [field, error] of Object.entries(errorItem)) {
      const message = getErrorMessage(error);

      if (!message) {
        continue;
      }

      errors[normalizeConditionErrorField(field)] = message;
    }
  }

  return errors;
}
