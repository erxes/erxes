export function getConditionsFieldErrors(
  fieldState: any,
): Record<string, string> {
  if (!fieldState?.error) return {};

  const errors: Record<string, string> = {};

  for (const errorItem of fieldState.error) {
    if (!errorItem) continue;

    for (let [field, error] of Object.entries<any>(errorItem)) {
      if (error?.message) {
        if (field === 'persistentMenuIds') field = 'persistentMenu';
        if (field === 'conditions') field = 'direct';
        errors[field] = error.message;
      }
    }
  }

  return errors;
}
