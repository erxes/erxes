import {
  IconAddressBook,
  IconBriefcase,
  IconBuilding,
  IconChartBar,
  IconInbox,
} from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { pluginsConfigState } from 'ui-modules';

export type IAgentSuggestionCategory =
  | 'contacts'
  | 'sales'
  | 'inbox'
  | 'reports';

export interface IAgentSuggestion {
  category: IAgentSuggestionCategory;
  icon: typeof IconAddressBook;
  prompt: string;
  /** Plugin remote that must be loaded for the prompt to be answerable. */
  requires?: 'sales_ui' | 'frontline_ui';
}

/**
 * Starter prompts on the empty state. Suggestions that need plugin data
 * are hidden when that plugin's UI remote isn't loaded — the model can't
 * answer them either way.
 */
const AGENT_SUGGESTIONS: IAgentSuggestion[] = [
  {
    category: 'contacts',
    icon: IconAddressBook,
    prompt: 'Which customers were created this week?',
  },
  {
    category: 'contacts',
    icon: IconBuilding,
    prompt: 'Find companies without an owner',
  },
  {
    category: 'sales',
    icon: IconBriefcase,
    prompt: 'Summarize my open deals',
    requires: 'sales_ui',
  },
  {
    category: 'sales',
    icon: IconChartBar,
    prompt: 'Which deals are closing this month?',
    requires: 'sales_ui',
  },
  {
    category: 'inbox',
    icon: IconInbox,
    prompt: 'Any unanswered conversations today?',
    requires: 'frontline_ui',
  },
  {
    category: 'reports',
    icon: IconChartBar,
    prompt: "Give me a report of last month's sales",
    requires: 'sales_ui',
  },
];

/** Suggestions filtered by which plugin remotes are currently loaded. */
export const useAgentSuggestions = (): IAgentSuggestion[] => {
  const pluginsConfig = useAtomValue(pluginsConfigState);

  return useMemo(
    () =>
      AGENT_SUGGESTIONS.filter(
        (suggestion) =>
          !suggestion.requires || Boolean(pluginsConfig?.[suggestion.requires]),
      ),
    [pluginsConfig],
  );
};
