import { TAiAgentMemoryItem } from '@/automations/components/settings/components/agents/hooks/useAiAgentMemoryItems';
import { useState } from 'react';

const GROUPS: TAiAgentMemoryItem['group'][] = ['Always on', 'Files', 'Sources'];

// Sources load separately, so their group stays up with a skeleton meanwhile
const LOADING_GROUP: TAiAgentMemoryItem['group'] = 'Sources';

const matches = (item: TAiAgentMemoryItem, query: string) =>
  !query || item.label.toLowerCase().includes(query);

/** The memory list searched by name and grouped, empty groups left out. */
export const useAiAgentMemoryList = (
  items: TAiAgentMemoryItem[],
  loading: boolean,
) => {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const visibleItems = items.filter((item) => matches(item, query));

  const groups = GROUPS.map((group) => ({
    group,
    items: visibleItems.filter((item) => item.group === group),
    isLoading: group === LOADING_GROUP && loading,
  })).filter(
    ({ items: groupItems, isLoading }) => groupItems.length || isLoading,
  );

  return {
    search,
    setSearch,
    groups,
    isEmpty: !visibleItems.length,
  };
};
