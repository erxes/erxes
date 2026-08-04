import {
  IconBell,
  IconBellOff,
  IconBrandAndroid,
  IconBrandApple,
  IconWorldWww,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Empty,
  EnumCursorDirection,
  mergeCursorData,
  RelativeDateDisplay,
  ScrollArea,
  Spinner,
} from 'erxes-ui';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { CPUserDetailSendNotificationDialog } from '@/contacts/client-portal-users/cp-user-detail/components/CPUserDetailSendNotificationDialog';
import { useClientPortalUser } from '@/contacts/client-portal-users/hooks/useClientPortalUser';
import { GET_CLIENT_PORTAL_NOTIFICATIONS_BY_CP_USER_ID } from '@/contacts/client-portal-users/graphql/getClientPortalNotificationsByCpUserId';

interface ICPNotificationResult {
  ios?: boolean | null;
  android?: boolean | null;
  web?: boolean | null;
}

interface ICPNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  readAt?: string | null;
  kind: string;
  result?: ICPNotificationResult | null;
  createdAt: string;
}

interface ICPNotificationListResponse {
  list: ICPNotification[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}

const NOTIFICATIONS_LIMIT = 20;

export function CPUserDetailNotifications() {
  const { t } = useTranslation('contact', {
    keyPrefix: 'clientPortalUser.detail',
  });
  const { cpUser } = useClientPortalUser();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const { data, loading, fetchMore } = useQuery<{
    getClientPortalNotificationsByCpUserId: ICPNotificationListResponse;
  }>(GET_CLIENT_PORTAL_NOTIFICATIONS_BY_CP_USER_ID, {
    variables: {
      cpUserId: cpUser?._id ?? '',
      limit: NOTIFICATIONS_LIMIT,
      direction: 'forward',
      status: 'ALL',
    },
    skip: !cpUser?._id,
  });

  const { ref: inViewRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !loading) {
        handleFetchMore();
      }
    },
  });

  const result = data?.getClientPortalNotificationsByCpUserId;
  const list = result?.list ?? [];
  const totalCount = result?.totalCount ?? 0;
  const pageInfo = result?.pageInfo;
  const hasNextPage = Boolean(pageInfo?.hasNextPage);

  function handleFetchMore() {
    if (!pageInfo?.endCursor || !cpUser?._id) return;
    fetchMore({
      variables: {
        cpUserId: cpUser._id,
        limit: NOTIFICATIONS_LIMIT,
        cursor: pageInfo.endCursor,
        direction: 'forward',
        status: 'ALL',
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const merged = mergeCursorData({
          direction: EnumCursorDirection.FORWARD,
          fetchMoreResult:
            fetchMoreResult.getClientPortalNotificationsByCpUserId,
          prevResult: prev.getClientPortalNotificationsByCpUserId,
        });
        const pageInfo = merged.pageInfo;
        return {
          ...prev,
          getClientPortalNotificationsByCpUserId: {
            list: merged.list ?? [],
            totalCount:
              merged.totalCount ??
              prev.getClientPortalNotificationsByCpUserId.totalCount ??
              0,
            pageInfo: pageInfo
              ? {
                  hasNextPage: pageInfo.hasNextPage ?? false,
                  hasPreviousPage: pageInfo.hasPreviousPage ?? false,
                  startCursor: pageInfo.startCursor ?? null,
                  endCursor: pageInfo.endCursor ?? null,
                }
              : prev.getClientPortalNotificationsByCpUserId.pageInfo,
          },
        };
      },
    });
  }

  if (!cpUser) return null;

  if (loading && list.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!loading && list.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12 px-8 gap-4">
          <Empty>
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconBellOff />
              </Empty.Media>
              <Empty.Title>
                {t('noNotifications', { defaultValue: 'No notifications' })}
              </Empty.Title>
              <Empty.Description>
                {t('noNotificationsDescription', {
                  defaultValue: 'This user has no notifications yet.',
                })}
              </Empty.Description>
            </Empty.Header>
          </Empty>
          {cpUser?.clientPortalId && (
            <Button onClick={() => setSendDialogOpen(true)}>
              <IconBell className="w-4 h-4" />
              {t('sendNotification', { defaultValue: 'Send notification' })}
            </Button>
          )}
        </div>
        {cpUser?._id && cpUser?.clientPortalId && (
          <CPUserDetailSendNotificationDialog
            open={sendDialogOpen}
            onOpenChange={setSendDialogOpen}
            cpUserId={cpUser._id}
            clientPortalId={cpUser.clientPortalId}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-8 py-3 border-b shrink-0">
        <span className="text-sm font-medium">
          {t('notifications', { defaultValue: 'Notifications' })}
        </span>
        {cpUser?.clientPortalId && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSendDialogOpen(true)}
          >
            <IconBell className="w-4 h-4" />
            {t('sendNotification', { defaultValue: 'Send notification' })}
          </Button>
        )}
      </div>
      <ScrollArea.Root className="w-full h-full overflow-hidden">
        <ScrollArea.Viewport className="[&>div]:block!">
          <div className="py-6 px-8 flex flex-col gap-3">
          {list.map((notification) => (
            <div
              key={notification._id}
              className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-medium line-clamp-1">
                    {notification.title}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">
                      {notification.priority}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {notification.type}
                    </Badge>
                    {notification.isRead ? (
                      <Badge variant="secondary">
                        {t('read', { defaultValue: 'Read' })}
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        {t('unread', { defaultValue: 'Unread' })}
                      </Badge>
                    )}
                    {notification.result &&
                      (notification.result.android ||
                        notification.result.ios ||
                        notification.result.web) && (
                      <span
                        className="inline-flex items-center gap-1 text-muted-foreground"
                        title={t('sentToPlatforms', {
                          defaultValue: 'Sent to platforms',
                        })}
                      >
                        {notification.result.android && (
                          <IconBrandAndroid className="size-4" />
                        )}
                        {notification.result.ios && (
                          <IconBrandApple className="size-4" />
                        )}
                        {notification.result.web && (
                          <IconWorldWww className="size-4" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  <RelativeDateDisplay.Value value={notification.createdAt} />
                </div>
              </div>
            </div>
          ))}
          {hasNextPage && (
            <div ref={inViewRef} className="flex justify-center py-2">
              {loading ? (
                <Spinner containerClassName="inline-flex flex-none" />
              ) : null}
            </div>
          )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Bar orientation="vertical" />
      </ScrollArea.Root>
      {cpUser?._id && cpUser?.clientPortalId && (
        <CPUserDetailSendNotificationDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          cpUserId={cpUser._id}
          clientPortalId={cpUser.clientPortalId}
        />
      )}
    </>
  );
}
