import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import {
  TAiKnowledgeSourceConfig,
  TAiKnowledgeSourceIndexStatus,
} from 'ui-modules';

export const CONTEXT_FILES_KEY = '__context-files__';

export type TAiAgentKnowledgeSourceSelections =
  TAiAgentForm['context']['knowledgeSources'];
export type TAiAgentKnowledgeSourceSelection =
  TAiAgentKnowledgeSourceSelections[number];

export const getSourceKey = (source: TAiKnowledgeSourceConfig) =>
  `${source.pluginName}:${source.moduleName}:${source.key}`;

export const isSameSource = (
  selection: Pick<
    TAiAgentKnowledgeSourceSelection,
    'pluginName' | 'moduleName' | 'key'
  >,
  source: TAiKnowledgeSourceConfig,
) =>
  selection.pluginName === source.pluginName &&
  selection.moduleName === source.moduleName &&
  selection.key === source.key;

export const findSourceSelection = (
  selections: TAiAgentKnowledgeSourceSelections,
  source: TAiKnowledgeSourceConfig,
) => selections.find((selection) => isSameSource(selection, source));

export const getSourceStatuses = (
  statuses: TAiKnowledgeSourceIndexStatus[],
  source: TAiKnowledgeSourceConfig,
) =>
  statuses.filter(
    (status) =>
      status.pluginName === source.pluginName &&
      status.moduleName === source.moduleName &&
      status.sourceKey === source.key,
  );

const hasConfigValue = (value: unknown) =>
  Array.isArray(value) ? value.length > 0 : value !== undefined && value !== '';

// Empty arrays survive in config long after their items are cleared, so key
// presence alone never means the source is scoped.
export const hasSourceSelection = (
  selection?: Pick<
    TAiAgentKnowledgeSourceSelection,
    'scope' | 'sourceIds' | 'config'
  >,
) =>
  !!selection &&
  (selection.scope === 'all' ||
    selection.sourceIds.length > 0 ||
    Object.values(selection.config || {}).some(hasConfigValue));

const getArrayConfigCount = (
  config: Record<string, unknown> | undefined,
  keys: string[],
) =>
  keys.reduce((sum, key) => {
    const value = config?.[key];

    return sum + (Array.isArray(value) ? value.length : 0);
  }, 0);

export const getSourceSelectionLabel = (
  selections: TAiAgentKnowledgeSourceSelections,
  source: TAiKnowledgeSourceConfig,
) =>
  findSourceSelection(selections, source)?.scope === 'all'
    ? 'All'
    : String(getSourceSelectionCount(selections, source));

export const getSourceSelectionCount = (
  selections: TAiAgentKnowledgeSourceSelections,
  source: TAiKnowledgeSourceConfig,
) => {
  const selection = findSourceSelection(selections, source);

  if (!selection) {
    return 0;
  }

  if (source.pluginName === 'core' && source.key === 'product.knowledge') {
    return (
      getArrayConfigCount(selection.config, [
        'includeCategoryIds',
        'includeProductIds',
        'categoryIds',
        'productIds',
      ]) || selection.sourceIds.length
    );
  }

  return selection.sourceIds.length;
};
