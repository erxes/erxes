import { Button, cn, RelativeDateDisplay } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';
import { TRIAGE_CONTENT_TYPE } from '@/triage/constants';
import { ITriage } from '@/triage/types/triage';
import { IconCaretLeftRight } from '@tabler/icons-react';
import { PriorityBadge } from '@/operation/components/PriorityInline';

export const TriageItem = ({ _id, name, createdAt, priority }: ITriage) => {
  const { record, openRecord } = useSidePanel();
  const isActive =
    record?.contentType === TRIAGE_CONTENT_TYPE && record.contentId === _id;

  return (
    <Button
      variant="ghost"
      className={cn(
        'justify-start h-auto rounded-lg p-2 items-start overflow-hidden text-left',
        isActive && 'bg-primary/10 hover:bg-primary/10',
      )}
      onClick={() =>
        openRecord({ contentType: TRIAGE_CONTENT_TYPE, contentId: _id })
      }
    >
      <div
        className={cn(
          'size-8 bg-foreground/5 rounded-full flex-none flex items-center justify-center relative text-muted-foreground',
          isActive && 'text-primary',
        )}
      >
        <IconCaretLeftRight className="size-4" />
      </div>
      <div className="flex-auto space-y-2 overflow-hidden">
        <h4
          className={cn('line-clamp-1 truncate', isActive && 'text-foreground')}
        >
          {name}
        </h4>
        <div className={cn('text-xs flex items-center justify-between')}>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={priority} />
          </div>

          <div className={cn('text-muted-foreground')}>
            <RelativeDateDisplay.Value value={createdAt} />
          </div>
        </div>
      </div>
    </Button>
  );
};
