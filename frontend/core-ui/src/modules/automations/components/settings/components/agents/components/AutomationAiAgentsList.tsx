import { AutomationAiAgentKinds } from '@/automations/components/settings/components/agents/components/AutomationAiAgentKinds';
import { AutomationAiAgentRecordTable } from '@/automations/components/settings/components/agents/components/AutomationAiAgentRecordTable';
import { AI_AGENT_KINDS } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { AutomationSettingsPageShell } from '@/automations/components/settings/components/AutomationSettingsPageShell';
import {
  getLastSelectedAiAgentKind,
  setLastSelectedAiAgentKind,
} from '@/automations/utils/aiAgentKindReturn';
import { useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationAiAgentsList = () => {
  const { t } = useTranslation('automations');
  const [kind, setKind] = useQueryState<string>('kind');
  const storedKind = getLastSelectedAiAgentKind();
  const activeKind =
    kind ||
    (AI_AGENT_KINDS.some(({ type }) => type === storedKind)
      ? storedKind
      : null) ||
    AI_AGENT_KINDS[0]?.type ||
    null;

  const handleKind = (value: string | null) => {
    const nextKind = value && kind === value ? null : value;
    setLastSelectedAiAgentKind(nextKind);
    setKind(nextKind);
  };

  return (
    <AutomationSettingsPageShell
      title={t('ai-agents', 'AI Agents')}
      description={t('ai-agents-description', 'Configure credential-backed AI agents, attach context files, and validate provider readiness before wiring them into automation actions.')}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <AutomationAiAgentKinds
          kinds={AI_AGENT_KINDS}
          selectedKind={activeKind}
          onKindSelect={handleKind}
        />

        <div className="min-w-0 flex-1 border-t p-4 xl:p-6">
          <AutomationAiAgentRecordTable kind={activeKind} />
        </div>
      </div>
    </AutomationSettingsPageShell>
  );
};
