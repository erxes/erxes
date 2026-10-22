import { TAiAgentProvider } from '@/automations/components/settings/components/agents/constants/providers';
import { AUTOMATIONS_AI_AGENT_MODELS } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';

export type TAiAgentModelGroup =
  | 'selected'
  | 'recommended'
  | 'available'
  | 'other';

export type TAiAgentModelStatus =
  | 'available'
  | 'deprecated'
  | 'unavailable'
  | 'unverified';

export type TAiAgentModelOption = {
  id: string;
  group: TAiAgentModelGroup;
  status: TAiAgentModelStatus;
  suggestion?: string | null;
  isDefault?: boolean | null;
  releasedAt?: string | null;
  reasoning?: boolean | null;
  contextWindow?: number | null;
};

export type TAiAgentModelsResponse = {
  automationsAiAgentModels?: TAiAgentModelOption[];
};

const GROUP_ORDER: TAiAgentModelGroup[] = [
  'selected',
  'recommended',
  'available',
  'other',
];

export const useAiAgentModelOptions = ({
  agentId,
  provider,
  savedModel,
  value,
}: {
  agentId?: string;
  provider: TAiAgentProvider;
  // The stored model gets its status from the server; picks made in the form
  // are looked up in the returned list instead of refetching per selection.
  savedModel?: string;
  value?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, previousData, loading, error } =
    useQuery<TAiAgentModelsResponse>(AUTOMATIONS_AI_AGENT_MODELS, {
      variables: { agentId, provider, selectedModel: savedModel },
      skip: !provider,
      fetchPolicy: 'cache-and-network',
    });

  const options = useMemo(
    () =>
      (data || previousData)?.automationsAiAgentModels?.filter(
        // The saved model is only "selected" while it is still the value.
        ({ group, id }) => group !== 'selected' || id === value,
      ) || [],
    [data, previousData, value],
  );

  const selectedOption = useMemo<TAiAgentModelOption | undefined>(() => {
    if (!value) {
      return undefined;
    }

    const option = options.find(({ id }) => id === value);

    return option
      ? { ...option, group: 'selected' }
      : { id: value, group: 'selected', status: 'unverified' };
  }, [options, value]);

  const query = search.trim();

  const groups = useMemo(() => {
    const rest = options.filter(({ id }) => id !== value);

    const selected = selectedOption ? [selectedOption] : [];

    return (
      GROUP_ORDER.map((group) => ({
        group,
        options:
          group === 'selected'
            ? selected
            : rest.filter((option) => option.group === group),
      }))
        .filter(({ options }) => options.length)
        // Unknown ids are mostly non-chat models; surface them only on search.
        .filter(({ group }) => group !== 'other' || !!query)
    );
  }, [options, query, selectedOption, value]);

  const canUseCustom =
    !!query && !options.some(({ id }) => id === query) && query !== value;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);

    if (!next) {
      setSearch('');
    }
  };

  return {
    open,
    setOpen: handleOpenChange,
    search,
    setSearch,
    groups,
    selectedOption,
    customModel: canUseCustom ? query : undefined,
    loading: loading && !options.length,
    error,
  };
};
