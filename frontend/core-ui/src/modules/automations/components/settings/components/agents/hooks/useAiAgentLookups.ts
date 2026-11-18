import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export type TAiAgentLookupOption = {
  objectType: string;
  label: string;
  description: string;
};

type TFindObjectTargetsResponse = {
  automationConstants?: {
    findObjectTargetsConst?: {
      value: string;
      label: string;
      lookup?: { description?: string };
    }[];
  };
};

// Only targets their plugin declared safe to look up for a customer appear
export const useAiAgentLookups = () => {
  const { control, setValue } = useFormContext<TAiAgentForm>();
  const selected = useWatch({ control, name: 'context.lookups' }) || [];
  const { data, loading, error } =
    useQuery<TFindObjectTargetsResponse>(AUTOMATION_CONSTANTS);

  const options: TAiAgentLookupOption[] = useMemo(
    () =>
      (data?.automationConstants?.findObjectTargetsConst || []).flatMap(
        (target) =>
          target.lookup
            ? [
                {
                  objectType: target.value,
                  label: target.label,
                  description: target.lookup.description || '',
                },
              ]
            : [],
      ),
    [data],
  );

  const toggleLookup = useCallback(
    (objectType: string, enabled: boolean) => {
      const next = enabled
        ? [...new Set([...selected, objectType])]
        : selected.filter((value) => value !== objectType);

      setValue('context.lookups', next, { shouldDirty: true });
    },
    [selected, setValue],
  );

  return { options, selected, toggleLookup, loading, error };
};
