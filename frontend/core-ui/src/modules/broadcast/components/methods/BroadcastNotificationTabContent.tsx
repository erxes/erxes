import { useClientPortal } from '@/client-portal/hooks/useClientPortal';
import {
  IconBellRinging,
  IconDeviceMobile,
} from '@tabler/icons-react';
import { Badge, Skeleton } from 'erxes-ui';

export const BroadcastTabPreviewNotificationContent = ({
  message,
}: {
  message: any;
}) => {
  const { cpId, notification } = message || {};
  const { title, content, inApp, isMobile } = notification || {};

  const { clientPortal, loading } = useClientPortal(cpId ?? '', {
    skip: !cpId,
  });

  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <div className="px-9 py-5 border rounded-md bg-muted space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Client portal:</span>
          {loading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span className="font-semibold">
              {clientPortal?.name || 'Unknown portal'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Channels:</span>
          {inApp !== false && (
            <Badge variant="secondary">
              <IconBellRinging className="h-3 w-3" />
              In-app
            </Badge>
          )}
          {isMobile && (
            <Badge variant="secondary">
              <IconDeviceMobile className="h-3 w-3" />
              Mobile & Web push
            </Badge>
          )}
          {inApp === false && !isMobile && (
            <span className="text-sm text-muted-foreground">None selected</span>
          )}
        </div>
      </div>

      <div className="max-w-md rounded-xl border bg-background shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/40">
          <IconBellRinging className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Notification preview</span>
        </div>

        <div className="px-4 py-4 flex gap-3 items-start">
          <svg
            viewBox="0 0 23 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-primary shrink-0"
          >
            <path
              d="M12.6796 16.7509C16.1909 11.598 19.4964 6.1423 22.4233 0.5C19.092 4.26153 15.1649 9.73484 11.5688 15.1003C9.66263 12.3476 7.38208 9.39684 4.76955 6.63271C7.3583 11.4228 8.66767 14.0594 10.459 16.7696C5.01156 25.0008 0.57666 32.5 0.57666 32.5C4.31137 28.1879 8.03367 23.4404 11.5688 18.3714C13.084 20.4647 15.0439 22.8349 18.1756 26.3911C18.1694 26.386 16.2147 22.1278 12.6796 16.7509Z"
              fill="currentColor"
            />
          </svg>
          <div className="min-w-0">
            <div className="mb-1 text-sm font-semibold">
              {title || 'Notification title'}
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {content || 'Notification content'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
