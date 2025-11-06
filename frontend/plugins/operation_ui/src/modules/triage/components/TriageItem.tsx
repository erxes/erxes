import { Button, cn, RelativeDateDisplay } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { ITriage } from '@/triage/types/triage';
import { IconCaretLeftRight } from '@tabler/icons-react';
import { PriorityBadge } from '@/operation/components/PriorityInline';

export const TriageItem = ({
  _id,
  name,
  teamId,
  createdAt,
  priority,
}: ITriage) => {
  const { triageId } = useParams();
  const isActive = triageId === _id;

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        'justify-start h-auto rounded-lg p-2 items-start overflow-hidden',
        isActive && 'bg-primary/10 hover:bg-primary/10',
      )}
    >
      <Link to={`/operation/team/${teamId}/triage/${_id}`}>
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
            className={cn(
              'line-clamp-1 truncate',
              isActive && 'text-foreground',
            )}
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
      </Link>
    </Button>
  );
};
