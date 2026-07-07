import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import {
  findSourceSelection,
  isSameSource,
  TAiAgentKnowledgeSourceSelections,
} from '@/automations/components/settings/components/agents/utils/aiAgentKnowledgeSources';
import { useFormContext, useWatch } from 'react-hook-form';
import { TAiKnowledgeSourceConfig } from 'ui-modules';

/**
 * Reads and writes the `context.knowledgeSources` form value: selecting
 * source ids/config for a source, and enabling/disabling a source entirely.
 */
export const useAiAgentKnowledgeSourceSelections = () => {
  const { control, setValue } = useFormContext<TAiAgentForm>();
  const knowledgeSources =
    useWatch({ control, name: 'context.knowledgeSources' }) || [];

  const updateSelections = (next: TAiAgentKnowledgeSourceSelections) => {
    setValue('context.knowledgeSources', next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSourceIdsChange = (
    source: TAiKnowledgeSourceConfig,
    sourceIds: string[],
    config?: Record<string, unknown>,
  ) => {
    const sourceIndex = knowledgeSources.findIndex((selection) =>
      isSameSource(selection, source),
    );
    const nextKnowledgeSources = [...knowledgeSources];
    const hasMeaningfulConfig = !!config && Object.keys(config).length > 0;

    if (sourceIds.length || hasMeaningfulConfig) {
      const selection = {
        pluginName: source.pluginName,
        moduleName: source.moduleName,
        key: source.key,
        sourceIds,
        config: config || {},
      };

      if (sourceIndex === -1) {
        nextKnowledgeSources.push(selection);
      } else {
        nextKnowledgeSources[sourceIndex] = selection;
      }
    } else if (sourceIndex !== -1) {
      nextKnowledgeSources.splice(sourceIndex, 1);
    }

    updateSelections(nextKnowledgeSources);
  };

  const handleSourceEnabledChange = (
    source: TAiKnowledgeSourceConfig,
    enabled: boolean,
  ) => {
    if (enabled) {
      const selection = findSourceSelection(knowledgeSources, source);

      handleSourceIdsChange(
        source,
        selection?.sourceIds || [],
        selection?.config || {},
      );
      return;
    }

    updateSelections(
      knowledgeSources.filter(
        (selection) => !isSameSource(selection, source),
      ),
    );
  };

  return { knowledgeSources, handleSourceIdsChange, handleSourceEnabledChange };
};
