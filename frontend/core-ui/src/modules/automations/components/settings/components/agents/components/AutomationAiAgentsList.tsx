import { AutomationAiAgentKindsGrid } from '@/automations/components/settings/components/agents/components/AutomationAiAgentKindsGrid';
import { AutomationAiAgentRecordTable } from '@/automations/components/settings/components/agents/components/AutomationAiAgentRecordTable';
import { AI_AGENT_KINDS } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { AutomationSettingsPageShell } from '@/automations/components/settings/components/AutomationSettingsPageShell';
import { useQueryState } from 'erxes-ui';

export const AutomationAiAgentsList = () => {
  const [kind, setKind] = useQueryState<string>('kind');
  const activeKind = kind || AI_AGENT_KINDS[0]?.type || null;

  const handleKind = (value: string | null) => {
    setKind(value && kind === value ? null : value);
  };

  return (
    <AutomationSettingsPageShell
      title="AI Agents"
      description="Configure credential-backed AI agents, attach context files, and validate provider readiness before wiring them into automation actions."
    >
      <div className="w-full">
        <AutomationAiAgentKindsGrid
          kinds={AI_AGENT_KINDS}
          selectedKind={activeKind}
          onKindSelect={handleKind}
        />
      </div>

      <div className="flex-1 p-6 border-t">
        <AutomationAiAgentRecordTable kind={activeKind} />
      </div>
    </AutomationSettingsPageShell>
  );
};
