import { ExecutionActionResult } from '@/automations/components/builder/history/components/AutomationHistoryByTable';
import { AutomationNodeType } from '@/automations/types';
import { IconCheck, IconQuestionMark, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Badge, cn, Label, Popover, Separator } from 'erxes-ui';
import { IAutomationHistory } from 'ui-modules';

type HistoryStatusType = 'success' | 'error' | 'unknown';

const STATUS_MAP: Record<
  HistoryStatusType,
  { icon: React.ElementType; className: string }
> = {
  success: {
    icon: IconCheck,
    className: 'text-success bg-success/10 border-success',
  },
  error: { icon: IconX, className: 'text-error bg-error/10 border-error' },
  unknown: {
    icon: IconQuestionMark,
    className: 'text-accent bg-accent/10 border-accent',
  },
};

export const useHistoryBeforeTitleContent = (history: IAutomationHistory) => {
  const beforeTitleContent = (id: string, type: AutomationNodeType) => {
    const data = getHistoryContent(history, id, type);
    if (!data) return null;

    const { status, createdAt, content } = data;
    const { icon: Icon, className } = STATUS_MAP[status];

    return (
      <Popover>
        <Popover.Trigger>
          <div className={cn(`p-1 border rounded`, className)}>
            <Icon className="w-4 h-4" />
          </div>
        </Popover.Trigger>
        <Popover.Content className="flex flex-col gap-2 bg-background">
          {createdAt && (
            <Label>{dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</Label>
          )}
          <Separator />
          <div className="flex justify-center text-primary">{content}</div>
        </Popover.Content>
      </Popover>
    );
  };

  return { beforeTitleContent };
};

const getHistoryContent = (
  history: IAutomationHistory,
  id: string,
  type: AutomationNodeType,
) => {
  if (type === 'trigger' && history.triggerId === id) {
    return {
      status: 'success' as HistoryStatusType,
      createdAt: history.createdAt,
      content: <Badge>Passed</Badge>,
    };
  }

  if (type === 'action') {
    const action = history?.actions?.find((a) => a.actionId === id);
    const status: HistoryStatusType = action
      ? action.result?.error
        ? 'error'
        : 'success'
      : 'unknown';

    if (status === 'unknown') {
      return null;
    }

    return {
      status,
      createdAt: action?.createdAt,
      content: action ? <ExecutionActionResult action={action} /> : null,
    };
  }

  return null;
};
