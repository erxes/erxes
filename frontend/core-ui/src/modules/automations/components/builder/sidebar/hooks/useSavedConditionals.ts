import { useMemo } from 'react';
import {
  AUTOMATION_CONDITIONALS_KEY,
  TAutomationConditionals,
} from 'ui-modules';

/**
 * The saved conditionals, stable across renders that do not change them: the
 * builder form hands back new objects on every edit anywhere, and a new
 * object would reset the draft being edited.
 */
export const useSavedConditionals = (config?: Record<string, unknown>) => {
  const saved = config?.[AUTOMATION_CONDITIONALS_KEY] as
    | TAutomationConditionals
    | undefined;
  const serialized = JSON.stringify(saved ?? {});

  return useMemo(
    () => JSON.parse(serialized) as TAutomationConditionals,
    [serialized],
  );
};
