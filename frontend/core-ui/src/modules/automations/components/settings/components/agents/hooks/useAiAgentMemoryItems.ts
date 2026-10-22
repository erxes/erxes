import { AI_AGENT_INSTRUCTIONS_KEY } from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import {
  CONTEXT_FILES_KEY,
  findSourceSelection,
  getSourceKey,
  getSourceSelectionLabel,
  getSourceStatuses,
  hasSourceSelection,
  TAiAgentKnowledgeSourceSelections,
} from '@/automations/components/settings/components/agents/utils/aiAgentKnowledgeSources';
import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import { useQuery } from '@apollo/client';
import {
  IconFileText,
  IconMessage2,
  IconPackage,
  IconPaperclip,
} from '@tabler/icons-react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  TAiKnowledgeSourceConfig,
  TAiKnowledgeSourceIndexStatus,
} from 'ui-modules';

type TAiKnowledgeSourcesResponse = {
  automationConstants?: {
    aiKnowledgeSourcesConst?: TAiKnowledgeSourceConfig[];
  };
};

export type TAiAgentMemoryItem = {
  key: string;
  group: 'Always on' | 'Files' | 'Sources';
  label: string;
  meta: string;
  icon: typeof IconFileText;
  warning?: boolean;
} & (
  | { kind: 'instructions' }
  | { kind: 'files' }
  | { kind: 'file'; file: TAiAgentForm['context']['files'][number] }
  | { kind: 'source'; source: TAiKnowledgeSourceConfig }
);

export const getAiAgentFileMemoryKey = (fileId: string) => `file:${fileId}`;

/**
 * Everything the agent remembers as one flat list: the always-on
 * instructions, each context file, and each plugin-provided source.
 */
export const useAiAgentMemoryItems = ({
  knowledgeSources,
  knowledgeStatuses,
}: {
  knowledgeSources: TAiAgentKnowledgeSourceSelections;
  knowledgeStatuses: TAiKnowledgeSourceIndexStatus[];
}) => {
  const { control } = useFormContext<TAiAgentForm>();
  const systemPrompt = useWatch({ control, name: 'context.systemPrompt' });
  const files = useWatch({ control, name: 'context.files' }) || [];
  const { data, loading } =
    useQuery<TAiKnowledgeSourcesResponse>(AUTOMATION_CONSTANTS);
  const sources = data?.automationConstants?.aiKnowledgeSourcesConst || [];

  const items: TAiAgentMemoryItem[] = [
    {
      kind: 'instructions',
      key: AI_AGENT_INSTRUCTIONS_KEY,
      group: 'Always on',
      label: 'Instructions',
      meta: `${systemPrompt?.trim().length || 0} chars`,
      icon: IconMessage2,
    },
    {
      kind: 'files',
      key: CONTEXT_FILES_KEY,
      group: 'Files',
      label: 'Upload and manage',
      meta: String(files.length),
      icon: IconPaperclip,
    },
    ...files.map(
      (file): TAiAgentMemoryItem => ({
        kind: 'file',
        key: getAiAgentFileMemoryKey(file.id),
        group: 'Files',
        label: file.name,
        meta: file.status || '',
        icon: IconFileText,
        warning: file.status === 'failed',
        file,
      }),
    ),
    ...sources.map((source): TAiAgentMemoryItem => {
      const selection = findSourceSelection(knowledgeSources, source);

      return {
        kind: 'source',
        key: getSourceKey(source),
        group: 'Sources',
        label: source.label,
        meta: getSourceSelectionLabel(knowledgeSources, source),
        icon: IconPackage,
        warning:
          (!!selection && !hasSourceSelection(selection)) ||
          getSourceStatuses(knowledgeStatuses, source).some(
            (status) => status.status === 'failed',
          ),
        source,
      };
    }),
  ];

  return { items, loading };
};
