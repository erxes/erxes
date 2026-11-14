import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { useCallback, useState } from 'react';
import { FieldPath, PathValue, useFormContext } from 'react-hook-form';

/**
 * A secret input that never shows a stored secret: the mask stands in until
 * the user chooses to replace it, and keeping it clears what was typed.
 */
export const useAiAgentSecretField = (
  name: FieldPath<TAiAgentForm>,
  existingSecretMask?: string,
) => {
  const { control, setValue } = useFormContext<TAiAgentForm>();
  const [isReplacing, setIsReplacing] = useState(false);
  const hasStoredSecret = !!existingSecretMask?.trim();

  const startReplacing = useCallback(() => setIsReplacing(true), []);

  const keepStoredSecret = useCallback(() => {
    setValue(name, '' as PathValue<TAiAgentForm, typeof name>);
    setIsReplacing(false);
  }, [setValue, name]);

  return {
    control,
    showMask: hasStoredSecret && !isReplacing,
    canKeepStoredSecret: hasStoredSecret,
    startReplacing,
    keepStoredSecret,
  };
};

export const secretInputValueOf = (value: unknown) =>
  typeof value === 'string' ? value : '';
