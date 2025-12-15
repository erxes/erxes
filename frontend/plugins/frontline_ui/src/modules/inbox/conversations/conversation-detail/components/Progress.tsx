import { IconCircleFilled } from '@tabler/icons-react';
import { cn, Tooltip } from 'erxes-ui';

export const ProgressDot = ({ status }: { status: 'open' | 'close' }) => {
  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger>
          <IconCircleFilled
            className={cn('size-2', {
              'text-warning': status === 'open',
              'text-success': status === 'close',
            })}
          />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p className="capitalize">{status}</p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const Progress = ({ conversationId }: { conversationId: string }) => {
  const conversationProgress = {
    totalScope: 100,
    openScope: 50,
    closeScope: 50,
  };

  return (
    <div className="flex justify-between w-full my-4">
      <span className="flex flex-col items-center gap-1">
        <span className="flex items-center gap-2">
          <ProgressDot status="open" />
          <p className="text-xs font-medium text-muted-foreground">
            Open conversations
          </p>
        </span>
        <p className="text-xs font-medium">
          {conversationProgress?.openScope || 0} /{' '}
          {conversationProgress?.totalScope || 0}
        </p>
      </span>
      <span className="flex flex-col items-center gap-1">
        <span className="flex items-center gap-2">
          <ProgressDot status="close" />
          <p className="text-xs font-medium text-muted-foreground">
            Close conversations
          </p>
        </span>
        <p className="text-xs font-medium">
          {conversationProgress?.closeScope || 0} /{' '}
          {conversationProgress?.totalScope || 0}
        </p>
      </span>
    </div>
  );
};
