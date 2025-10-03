import { INotification } from '@/notification/my-inbox/types/notifications';
import { Badge, Button, cn, RelativeDateDisplay } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { Link, useParams } from 'react-router-dom';
import { pluginsConfigState } from 'ui-modules';

export const NotificationItem = ({
  _id,
  createdAt = '',
  message,
  isRead,
  contentType = '',
  priority,
}: INotification) => {
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
      <Link to={`/my-inbox/${_id}`}>
        <div
          className={cn(
            'size-8 bg-foreground/5 rounded-full flex-none flex items-center justify-center relative',
            isActive && 'text-primary',
          )}
        >
          <NotificationIcon contentType={contentType} />
          {!isRead && (
            <div className="size-1.5 absolute bg-destructive rounded-full top-1.5 right-1.5" />
          )}
        </div>
        <div className="flex-auto space-y-2 overflow-hidden">
          <h4
            className={cn(
              'line-clamp-1 truncate',
              isRead ? 'text-muted-foreground' : 'text-semibold',
              isActive && 'text-foreground',
            )}
          >
            {message}
          </h4>
          <div className={cn('text-xs flex items-center justify-between')}>
            <div className="flex items-center gap-2">
              <Badge className="capitalize" variant="secondary">
                {priority}
              </Badge>
            </div>

            <div
              className={cn(isRead ? 'text-muted-foreground' : 'text-semibold')}
            >
              <RelativeDateDisplay.Value value={createdAt} />
            </div>
          </div>
        </div>
      </Link>
    </Button>
  );
};

const NotificationIcon = ({ contentType }: { contentType: string }) => {
  const pluginName = contentType?.split(':')[0] || '';
  const pluginMetaData = (useAtomValue(pluginsConfigState) || {})[
    pluginName + '_ui'
  ];

  const Icon = pluginMetaData?.icon;

  return Icon ? <Icon className="size-4" /> : null;
};
