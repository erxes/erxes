import {
  IconChevronRight,
  IconCode,
  IconFileText,
  IconLoader2,
  IconSearch,
  IconTool,
  IconBrain,
  IconX,
} from '@tabler/icons-react';
import { Collapsible, cn } from 'erxes-ui';
import { useState } from 'react';

import type { TAgentWorkStep } from '../utils/agentWorkSteps';
import { agentStepLabel, describeToolCall } from '../utils/agentWorkSteps';

const truncate = (text: string, max = 4000): string =>
  text.length > max ? `${text.slice(0, max)}\n…` : text;

const formatJson = (value: unknown): string => {
  try {
    return truncate(JSON.stringify(value, null, 2) ?? '');
  } catch {
    return String(value);
  }
};

const stepIcon = (step: TAgentWorkStep) => {
  if (step.kind === 'reasoning') {
    return IconBrain;
  }

  switch (step.tool.toolName) {
    case 'searchTools':
    case 'searchGraphql':
      return IconSearch;
    case 'readFile':
      return IconFileText;
    case 'execute_typescript':
      return IconCode;
    default:
      return IconTool;
  }
};

/** Expandable detail payloads for one step row. */
const StepDetails = ({ step }: { step: TAgentWorkStep }) => {
  if (step.kind === 'reasoning') {
    return step.text ? (
      <p className="mt-1 whitespace-pre-wrap rounded-md border border-dashed bg-muted/30 p-2 text-xs text-muted-foreground">
        {truncate(step.text, 8000)}
      </p>
    ) : null;
  }

  const { tool } = step;
  const { args } = describeToolCall(tool.toolName, tool.input);
  const inputText = formatJson(args);
  const showInput = inputText && inputText !== '{}' && inputText !== '""';
  const outputText = formatJson(tool.output);
  const showOutput =
    tool.state === 'output-available' &&
    outputText &&
    outputText !== '{}' &&
    outputText !== '""';

  return (
    <div className="mt-1 space-y-1.5">
      {showInput && (
        <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 text-xs">
          {inputText}
        </pre>
      )}
      {showOutput && (
        <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 text-xs">
          {outputText}
        </pre>
      )}
      {tool.state === 'output-error' && (
        <p className="text-xs text-destructive">
          {tool.errorText ?? 'Tool execution failed.'}
        </p>
      )}
    </div>
  );
};

/**
 * One row inside the collapsible work-steps group: icon, human label, and
 * an expandable input/output detail. A still-running step spins; a failed
 * one turns red.
 */
export const AgentStepRow = ({
  step,
  streaming,
}: {
  step: TAgentWorkStep;
  streaming: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const isTool = step.kind === 'tool';
  const running =
    streaming &&
    isTool &&
    (step.tool.state === 'input-streaming' ||
      step.tool.state === 'input-available');
  const failed = isTool && step.tool.state === 'output-error';
  const Icon = stepIcon(step);
  const label = agentStepLabel(step);
  const expandable =
    step.kind === 'reasoning'
      ? step.text.length > 0
      : Boolean(step.tool.input || step.tool.output || step.tool.errorText);

  if (!expandable) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-1 py-1 text-xs',
          failed ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {running ? (
          <IconLoader2 className="size-3.5 shrink-0 animate-spin" />
        ) : failed ? (
          <IconX className="size-3.5 shrink-0" />
        ) : (
          <Icon className="size-3.5 shrink-0" />
        )}
        <span className="min-w-0 truncate">{label}</span>
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-xs transition-colors hover:text-foreground',
            failed ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {running ? (
            <IconLoader2 className="size-3.5 shrink-0 animate-spin" />
          ) : failed ? (
            <IconX className="size-3.5 shrink-0" />
          ) : (
            <Icon className="size-3.5 shrink-0" />
          )}
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <IconChevronRight
            className={cn(
              'size-3.5 shrink-0 transition-transform',
              open && 'rotate-90',
            )}
          />
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="pl-6 pr-1 pb-1">
        <StepDetails step={step} />
      </Collapsible.Content>
    </Collapsible>
  );
};
