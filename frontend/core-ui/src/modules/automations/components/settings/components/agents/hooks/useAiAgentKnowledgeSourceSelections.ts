import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import {
  findSourceSelection,
  hasSourceSelection,
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
    const scope =
      sourceIndex === -1 ? undefined : knowledgeSources[sourceIndex].scope;

    if (hasSourceSelection({ scope, sourceIds, config: config || {} })) {
      const selection = {
        pluginName: source.pluginName,
        moduleName: source.moduleName,
        key: source.key,
        ...(scope ? { scope } : {}),
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
      knowledgeSources.filter((selection) => !isSameSource(selection, source)),
    );
  };

  const handleSourceScopeChange = (
    source: TAiKnowledgeSourceConfig,
    scope: 'all' | 'selected',
  ) => {
    const sourceIndex = knowledgeSources.findIndex((selection) =>
      isSameSource(selection, source),
    );
    const existing =
      sourceIndex === -1 ? undefined : knowledgeSources[sourceIndex];
    const sourceIds = existing?.sourceIds || [];
    const config = existing?.config || {};
    const nextKnowledgeSources = [...knowledgeSources];

    // Narrowing back to an empty selection leaves nothing to index.
    if (
      scope === 'selected' &&
      !hasSourceSelection({ scope, sourceIds, config })
    ) {
      if (sourceIndex !== -1) {
        nextKnowledgeSources.splice(sourceIndex, 1);
      }

      updateSelections(nextKnowledgeSources);
      return;
    }

    const selection = {
      pluginName: source.pluginName,
      moduleName: source.moduleName,
      key: source.key,
      scope,
      sourceIds,
      config,
    };

    if (sourceIndex === -1) {
      nextKnowledgeSources.push(selection);
    } else {
      nextKnowledgeSources[sourceIndex] = selection;
    }

    updateSelections(nextKnowledgeSources);
  };

  return {
    knowledgeSources,
    handleSourceIdsChange,
    handleSourceEnabledChange,
    handleSourceScopeChange,
  };
};
