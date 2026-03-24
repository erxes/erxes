import { IActivity } from '@/activity/types';
import { format } from 'date-fns';
import { Badge } from 'erxes-ui';

export const ActivityDate = ({
  metadata,
  type,
}: {
  metadata: IActivity['metadata'];
  type: 'start' | 'end';
}) => {
  const { previousValue, newValue } = metadata;

  return (
    <div className="inline-flex items-center gap-1 whitespace-nowrap">
      changed {type === 'start' ? 'start' : 'end'} date
      {previousValue && (
        <>
          {' '}
          <Badge variant="secondary" className="flex-none">
            {format(new Date(previousValue), 'MMM d, yyyy')}
          </Badge>
        </>
      )}{' '}
      to
      <Badge variant="secondary" className="flex-none">
        {format(new Date(newValue), 'MMM d, yyyy')}
      </Badge>
    </div>
  );
};
