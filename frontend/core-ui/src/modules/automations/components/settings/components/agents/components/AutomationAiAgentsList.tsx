import { AutomationAiAgentKindsGrid } from '@/automations/components/settings/components/agents/components/AutomationAiAgentKindsGrid';
import { AutomationAiAgentRecordTable } from '@/automations/components/settings/components/agents/components/AutomationAiAgentRecordTable';
import { AI_AGENT_KINDS } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { Card, useQueryState } from 'erxes-ui';

export const AutomationAiAgentsList = () => {
  const [kind, setKind] = useQueryState<string>('kind');
  const activeKind = kind || AI_AGENT_KINDS[0]?.type || null;

  const handleKind = (value: string | null) => {
    setKind(value && kind === value ? null : value);
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 rounded-lg bg-muted/20 p-6">
      <div className="space-y-2">
        <h1 className="text-lg font-semibold">AI Agents</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Configure credential-backed AI agents, attach context files, and
          validate provider readiness before wiring them into automation
          actions.
        </p>
      </div>

      <div className="max-w-2xl">
        <AutomationAiAgentKindsGrid
          kinds={AI_AGENT_KINDS}
          selectedKind={activeKind}
          onKindSelect={handleKind}
        />
      </div>

      <Card className="flex-1 p-6">
        <AutomationAiAgentRecordTable kind={activeKind} />
      </Card>
    </div>
  );
};
