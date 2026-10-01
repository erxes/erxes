import { IconDownload } from '@tabler/icons-react';
import { Button, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { CallHistoryAgent } from '../../types';
import {
  ALL_AGENTS,
  CALLBACK_WINDOW_OPTIONS,
  formatCallbackWindow,
} from './slaUtils';

interface SlaSettingsBarProps {
  agents: CallHistoryAgent[];
  agentExtension: string;
  callbackWindowMinutes: number;
  shortAbandonSeconds: number;
  exporting: boolean;
  onAgentChange: (extension: string) => void;
  onCallbackWindowChange: (minutes: number) => void;
  onExport: () => void;
}

export function SlaSettingsBar({
  agents,
  agentExtension,
  callbackWindowMinutes,
  shortAbandonSeconds,
  exporting,
  onAgentChange,
  onCallbackWindowChange,
  onExport,
}: SlaSettingsBarProps) {
  const { t } = useTranslation('frontline');

  const callbackWindow = (minutes: number) =>
    formatCallbackWindow(minutes, (key, fallback) => t(key, fallback));

  const hasSelectedAgent = agents.some(
    ({ extension }) => extension === agentExtension,
  );

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border bg-card px-5 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {t('agent', 'Agent')}
        </span>
        <Select
          value={agentExtension}
          onValueChange={(next) => next && onAgentChange(next)}
        >
          <Select.Trigger className="h-8 w-48">
            <Select.Value
              placeholder={t('all-agents', { defaultValue: 'All agents' })}
            />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ALL_AGENTS}>
              {t('all-agents', { defaultValue: 'All agents' })}
            </Select.Item>
            {agentExtension !== ALL_AGENTS && !hasSelectedAgent && (
              <Select.Item value={agentExtension}>{agentExtension}</Select.Item>
            )}
            {agents.map((agent) => (
              <Select.Item key={agent.extension} value={agent.extension}>
                {agent.name
                  ? `${agent.name} · ${agent.extension}`
                  : agent.extension}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {t('sla-callback-window', 'Callback window')}
        </span>
        <Select
          value={String(callbackWindowMinutes)}
          onValueChange={(next) => next && onCallbackWindowChange(Number(next))}
        >
          <Select.Trigger className="h-8 w-24">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {CALLBACK_WINDOW_OPTIONS.map((option) => (
              <Select.Item key={option} value={String(option)}>
                {callbackWindow(option)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      <Button
        variant="secondary"
        size="sm"
        className="ml-auto"
        onClick={onExport}
        disabled={exporting}
      >
        <IconDownload />
        {t('export-excel', 'Export Excel')}
      </Button>

      <p className="basis-full text-xs text-muted-foreground">
        {t('sla-answered-formula-hint', {
          defaultValue:
            'Service level = answered inbound calls ÷ inbound calls offered, however long the caller waited. Callers who hang up in under {{abandon}} s are not counted as offered.',
          abandon: shortAbandonSeconds,
        })}{' '}
        {callbackWindowMinutes > 0 &&
          t('sla-callback-answered-hint', {
            defaultValue:
              'A missed call counts as answered once we called the number back and the customer answered within {{window}}.',
            window: callbackWindow(callbackWindowMinutes),
          })}
      </p>
    </div>
  );
}
