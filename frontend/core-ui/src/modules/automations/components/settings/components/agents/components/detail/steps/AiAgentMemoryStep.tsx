import { AiAgentMemoryEditor } from '@/automations/components/settings/components/agents/components/detail/memory/AiAgentMemoryEditor';
import { AiAgentMemoryList } from '@/automations/components/settings/components/agents/components/detail/memory/AiAgentMemoryList';
import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { AiAgentKnowledgeSourcesProvider } from '@/automations/components/settings/components/agents/context/AiAgentKnowledgeSourcesContext';
import { useAiAgentKnowledgeSourceSelections } from '@/automations/components/settings/components/agents/hooks/useAiAgentKnowledgeSourceSelections';
import { useAiAgentMemoryItems } from '@/automations/components/settings/components/agents/hooks/useAiAgentMemoryItems';

export const AiAgentMemoryStep = () => {
  const { memoryKey, openMemory, knowledgeStatuses } =
    useAiAgentDetailContext();
  const selections = useAiAgentKnowledgeSourceSelections();
  const { items, loading } = useAiAgentMemoryItems({
    knowledgeSources: selections.knowledgeSources,
    knowledgeStatuses,
  });
  const activeItem = items.find((item) => item.key === memoryKey) || items[0];

  return (
    <AiAgentKnowledgeSourcesProvider
      value={{ ...selections, statuses: knowledgeStatuses }}
    >
      <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-5 md:grid-cols-[260px_minmax(0,1fr)] md:grid-rows-1">
        <AiAgentMemoryList
          items={items}
          loading={loading}
          activeKey={activeItem.key}
          onSelect={openMemory}
        />
        <AiAgentMemoryEditor key={activeItem.key} item={activeItem} />
      </div>
    </AiAgentKnowledgeSourcesProvider>
  );
};
