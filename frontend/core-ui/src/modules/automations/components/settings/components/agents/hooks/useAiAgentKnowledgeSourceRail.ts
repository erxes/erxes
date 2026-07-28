import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import {
  CONTEXT_FILES_KEY,
  getSourceKey,
  getSourceSelectionCount,
  TAiAgentKnowledgeSourceSelections,
} from '@/automations/components/settings/components/agents/utils/aiAgentKnowledgeSources';
import { useSessionTab } from '@/automations/hooks/useSessionTab';
import { useQuery } from '@apollo/client';
import { IconFileText, IconPaperclip } from '@tabler/icons-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { TAiKnowledgeSourceConfig } from 'ui-modules';

type TAiKnowledgeSourcesResponse = {
  automationConstants?: {
    aiKnowledgeSourcesConst?: TAiKnowledgeSourceConfig[];
  };
};

export type TAiAgentKnowledgeSourceRailItem = {
  key: string;
  label: string;
  count: number;
  icon: typeof IconFileText;
};

/**
 * Left-rail navigation of the knowledge sources form: the static
 * "Context files" entry plus one entry per plugin-provided source, with
 * selection counts and the active entry resolution.
 */
export const useAiAgentKnowledgeSourceRail = (
  knowledgeSources: TAiAgentKnowledgeSourceSelections,
) => {
  const { control } = useFormContext<TAiAgentForm>();
  const files = useWatch({ control, name: 'context.files' }) || [];
  const { data } = useQuery<TAiKnowledgeSourcesResponse>(AUTOMATION_CONSTANTS);
  const sources = data?.automationConstants?.aiKnowledgeSourcesConst || [];

  const [activeKey, setActiveKey] = useSessionTab(
    'aiAgentKnowledgeSourceRail',
    sources.length ? getSourceKey(sources[0]) : CONTEXT_FILES_KEY,
  );

  const railItems: TAiAgentKnowledgeSourceRailItem[] = [
    {
      key: CONTEXT_FILES_KEY,
      label: 'Context files',
      count: files.length,
      icon: IconPaperclip,
    },
    ...sources.map((source) => ({
      key: getSourceKey(source),
      label: source.label,
      count: getSourceSelectionCount(knowledgeSources, source),
      icon: IconFileText,
    })),
  ];

  const resolvedKey = railItems.some((item) => item.key === activeKey)
    ? activeKey
    : railItems[0]?.key;
  const activeSource = sources.find(
    (source) => getSourceKey(source) === resolvedKey,
  );

  return { railItems, resolvedKey, setActiveKey, activeSource };
};
