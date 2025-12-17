import { AutomationAiAgentRecordTable } from '@/automations/components/settings/components/agents/components/AutomationAiAgentRecordTable';
import { AutomationAiAgentsEmptyState } from '@/automations/components/settings/components/agents/components/AutomationAiAgentsEmptyState';
import { AutomationAiAgentKindsGrid } from '@/automations/components/settings/components/agents/components/AutomationAiAgentKindsGrid';
import { AI_AGENT_KINDS } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { ScrollArea, useQueryState } from 'erxes-ui';

export const AutomationAiAgentsList = () => {
  const [kind, setKind] = useQueryState<string>('kind');

  const handleKind = (value: string | null) => {
    setKind(value && kind === value ? null : value);
  };

  return (
    <div className="h-full w-full grid grid-cols-12 gap-6 bg-muted/20 p-6 rounded-lg">
      {/* Left Panel - Agent Types */}
      <div className="col-span-12 lg:col-span-5">
        <ScrollArea className="h-full">
          <div className="h-full w-full px-6 py-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-semibold">AI Agents</h1>
              <span className="font-normal text-muted-foreground text-sm">
                Set up your AI agents and start automating conversations with
                your customers.
              </span>
            </div>

            <AutomationAiAgentKindsGrid
              kinds={AI_AGENT_KINDS}
              selectedKind={kind}
              onKindSelect={handleKind}
            />
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Agent Records Table or Empty State */}
      <div className="col-span-12 lg:col-span-7">
        <div className="h-full px-6 py-6 bg-background rounded-lg border">
          <AutomationAiAgentsListContent kind={kind} />
        </div>
      </div>
    </div>
  );
};

const AutomationAiAgentsListContent = ({ kind }: { kind: string | null }) => {
  if (!kind) {
    return <AutomationAiAgentsEmptyState />;
  }

  return <AutomationAiAgentRecordTable />;
};
