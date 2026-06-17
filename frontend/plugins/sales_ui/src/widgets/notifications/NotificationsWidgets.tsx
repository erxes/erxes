import { useQuery } from '@apollo/client';
import {
  IconBriefcase,
  IconExternalLink,
  IconInfoCircle,
} from '@tabler/icons-react';
import {
  Avatar,
  Button,
  RelativeDateDisplay,
  Skeleton,
  readImage,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IUser, TNotification } from 'ui-modules';

import { GET_DEAL_DETAIL } from '@/deals/graphql/queries/DealsQueries';
import { IDeal } from '@/deals/types/deals';

const getUserDisplayName = (user?: IUser) =>
  user?.details?.fullName || user?.email || 'Unknown user';

const buildDealPath = (deal: IDeal) => {
  const searchParams = new URLSearchParams({ salesItemId: deal._id });
  if (deal.boardId) searchParams.set('boardId', deal.boardId);
  if (deal.pipeline?._id) searchParams.set('pipelineId', deal.pipeline._id);
  return `/sales/deals?${searchParams.toString()}`;
};

const SalesDealNotificationContent = ({
  action,
  createdAt,
  contentTypeId,
  fromUser,
}: TNotification) => {
  const { data, loading, error } = useQuery<{ dealDetail: IDeal }>(
    GET_DEAL_DETAIL,
    {
      variables: { _id: contentTypeId || '' },
      skip: !contentTypeId,
    },
  );

  if (error) {
    return (
      <NotificationContentUnavailable
        title="Failed to load deal"
        description={error.message}
      />
    );
  }

  if (!contentTypeId) {
    return (
      <NotificationContentUnavailable
        title="Notification content unavailable"
        description="This sales notification is missing a linked deal."
      />
    );
  }

  const deal = data?.dealDetail;

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto justify-center items-center min-h-screen text-muted-foreground">
      <div className="size-36 bg-sidebar rounded-2xl border-2 border-dashed flex flex-col items-center justify-center">
        <IconBriefcase
          size={64}
          className="text-accent-foreground"
          stroke={1}
        />
      </div>

      <p className="font-bold text-lg text-foreground">Deal</p>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <Avatar.Image
              src={readImage(fromUser?.details?.avatar || '')}
              alt={getUserDisplayName(fromUser)}
            />
            <Avatar.Fallback className="rounded-lg text-xs">
              {getUserDisplayName(fromUser)[0].toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
          <span className="font-semibold text-foreground">
            {getUserDisplayName(fromUser)}
          </span>
        </div>

        <p className="flex flex-wrap items-baseline justify-center gap-1 text-foreground">
          <span>{action || 'has updated deal'}</span>
          {loading ? (
            <Skeleton className="inline-block w-24 h-4 align-middle" />
          ) : (
            <span className="font-bold text-foreground">
              {deal?.name || ''}
            </span>
          )}
        </p>
      </div>

      {createdAt && (
        <p className="text-sm text-accent-foreground">
          <RelativeDateDisplay.Value value={createdAt} />
        </p>
      )}

      {!loading && deal && (
        <Button variant="secondary" asChild>
          <Link to={buildDealPath(deal)}>
            <IconExternalLink className="size-4" />
            Open deal
          </Link>
        </Button>
      )}
    </div>
  );
};

const NotificationContentUnavailable = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
          <IconInfoCircle className="size-5" />
        </div>
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const NotificationsWidgets = (props: TNotification) => {
  const [, moduleName] = (props.contentType || '').replace(':', '.').split('.');

  if (moduleName === 'deal') {
    return <SalesDealNotificationContent {...props} />;
  }

  return (
    <NotificationContentUnavailable
      title="Notification content unavailable"
      description="This sales notification does not have a linked detail view yet."
    />
  );
};

export default NotificationsWidgets;
