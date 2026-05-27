import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import {
  buildAiAgentRuntimeSummary,
  formatAiAgentByteSize,
  TAiAgentRuntimeSummarySource,
} from '@/automations/utils/ai/aiAgentRuntimeSummary';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { Alert, Badge, Card } from 'erxes-ui';

const INPUT_MODE_LABELS = {
  focused: 'Focused field',
  'full-trigger': 'Full trigger payload',
  'previous-action': 'Previous action result',
  custom: 'Custom text',
} as const;

export const AiAgentRuntimeInfo = ({
  agent,
  actionConfig,
  title = 'Runtime Snapshot',
  description = 'Quick signal for response size and timeout risk before this automation runs.',
}: {
  agent?: TAiAgentRuntimeSummarySource | null;
  actionConfig?: Partial<TAiAgentConfigForm>;
  title?: string;
  description?: string;
}) => {
  if (!agent) {
    return (
      <Alert className="bg-muted/20">
        <IconInfoCircle />
        <Alert.Title>Runtime Snapshot</Alert.Title>
        <Alert.Description>
          <p>
            Select an AI agent to preview its timeout, token budget, prompt
            size, and context load.
          </p>
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
          <Badge variant="secondary">{summary.maxTokens} max tokens</Badge>
          <Badge variant="secondary">{summary.timeoutMs} ms timeout</Badge>
          <Badge variant="secondary">
            temp {summary.temperature.toFixed(1)}
          </Badge>
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-4">
            <span>System prompt</span>
            <span className="text-foreground">
              {summary.systemPromptChars} chars
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Goal prompt</span>
            <span className="text-foreground">
              {summary.goalPromptChars} chars
              {summary.goalItemCount
                ? ` across ${summary.goalItemCount} item${
                    summary.goalItemCount > 1 ? 's' : ''
                  }`
                : ''}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Context files</span>
            <span className="text-foreground">
              {summary.contextFileCount} file
              {summary.contextFileCount === 1 ? '' : 's'}
              {summary.contextBytes
                ? ` / ${formatAiAgentByteSize(summary.contextBytes)}`
                : ''}
            </span>
          </div>
          {summary.customInputChars ? (
            <div className="flex items-center justify-between gap-4">
              <span>Custom input</span>
              <span className="text-foreground">
                {summary.customInputChars} chars
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <span>Input mode</span>
            <span className="text-foreground">
              {INPUT_MODE_LABELS[summary.inputMode]}
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
                  <p>{note.text}</p>
                </Alert.Description>
              </Alert>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
};
