import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import {
  buildAiAgentRuntimeSummary,
  formatAiAgentByteSize,
  TAiAgentRuntimeSummarySource,
} from '@/automations/utils/ai/aiAgentRuntimeSummary';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { Alert, Badge, Card } from 'erxes-ui';
import { DeepPartial } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const INPUT_MODE_LABEL_KEYS = {
  'full-trigger': 'ai-agent-input-mode-full-trigger',
  'output-variable': 'ai-agent-input-mode-output-variable',
  custom: 'ai-agent-input-mode-custom',
} as const;

export const AiAgentRuntimeInfo = ({
  agent,
  actionConfig,
  title = 'Runtime Snapshot',
  description = 'Quick signal for response size and timeout risk before this automation runs.',
}: {
  agent?: TAiAgentRuntimeSummarySource | null;
  actionConfig?: DeepPartial<TAiAgentConfigForm>;
  title?: string;
  description?: string;
}) => {
  const { t } = useTranslation('automations');

  if (!agent) {
    return (
      <Alert className="bg-muted/20">
        <IconInfoCircle />
        <Alert.Title>{t('runtime-snapshot')}</Alert.Title>
        <Alert.Description>
          <p>{t('ai-agent-runtime-select-agent')}</p>
        </Alert.Description>
      </Alert>
    );
  }

  const summary = buildAiAgentRuntimeSummary({ agent, actionConfig });

  return (
    <Card className="border-dashed bg-muted/20 shadow-none">
      <Card.Content className="grid gap-4 p-4">
        <div className="space-y-1">
          <div className="text-sm font-medium">{title}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {summary.model ? (
            <Badge variant="secondary" className="max-w-full truncate">
              {summary.model}
            </Badge>
          ) : null}
          <Badge variant="secondary">
            {t('ai-agent-runtime-max-tokens', { value: summary.maxTokens })}
          </Badge>
          <Badge variant="secondary">
            {t('ai-agent-runtime-timeout', { value: summary.timeoutMs })}
          </Badge>
          <Badge variant="secondary">
            {t('ai-agent-runtime-temp', {
              value: summary.temperature.toFixed(1),
            })}
          </Badge>
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-4">
            <span>{t('ai-agent-runtime-system-prompt')}</span>
            <span className="text-foreground">
              {t('ai-agent-runtime-chars', {
                value: summary.systemPromptChars,
              })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>{t('ai-agent-runtime-goal-prompt')}</span>
            <span className="text-foreground">
              {t('ai-agent-runtime-chars', { value: summary.goalPromptChars })}
              {summary.goalItemCount
                ? ` ${
                    summary.goalItemCount > 1
                      ? t('ai-agent-runtime-across-items', {
                          value: summary.goalItemCount,
                        })
                      : t('ai-agent-runtime-across-item')
                  }`
                : ''}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>{t('ai-agent-runtime-context-files')}</span>
            <span className="text-foreground">
              {summary.contextFileCount === 1
                ? t('ai-agent-runtime-file', {
                    value: summary.contextFileCount,
                  })
                : t('ai-agent-runtime-files', {
                    value: summary.contextFileCount,
                  })}
              {summary.contextBytes
                ? ` / ${formatAiAgentByteSize(summary.contextBytes)}`
                : ''}
            </span>
          </div>
          {summary.inputChars ? (
            <div className="flex items-center justify-between gap-4">
              <span>{t('ai-agent-input')}</span>
              <span className="text-foreground">
                {t('ai-agent-runtime-chars', { value: summary.inputChars })}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <span>{t('ai-agent-input-mode')}</span>
            <span className="text-foreground">
              {t(INPUT_MODE_LABEL_KEYS[summary.inputMode])}
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          {summary.notes.map((note, index) => {
            const Icon =
              note.variant === 'warning' ? IconAlertTriangle : IconInfoCircle;

            return (
              <Alert
                key={`${note.variant}-${index}`}
                variant={note.variant === 'warning' ? 'warning' : 'default'}
              >
                <Icon />
                <Alert.Description>
                  <p>
                    {'translationKey' in note
                      ? t(note.translationKey)
                      : note.text}
                  </p>
                </Alert.Description>
              </Alert>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
};
