import { Button, cn, RelativeDateDisplay } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { ITriage } from '@/triage/types/triage';
import { IconHelpSquareRounded } from '@tabler/icons-react';

export const TriageItem = ({ _id, name, teamId, createdAt }: ITriage) => {
  const { id } = useParams();
  const isActive = id === _id;

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
            'size-8 bg-foreground/5 rounded-full flex-none flex items-center justify-center relative',
            isActive && 'text-primary',
          )}
        >
          <IconHelpSquareRounded />
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
          <div className={cn('text-muted-foreground')}>
            <RelativeDateDisplay.Value value={createdAt} />
          </div>
        </div>
      </Link>
    </Button>
  );
};
