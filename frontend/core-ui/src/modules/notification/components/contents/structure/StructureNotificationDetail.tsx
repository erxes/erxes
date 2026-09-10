import { IconBuildings, IconInfoCircle } from '@tabler/icons-react';
import { Avatar, RelativeDateDisplay, Spinner, readImage } from 'erxes-ui';
import { ReactNode } from 'react';
import { TNotification } from 'ui-modules';

type StructureDetailItem = {
  label: string;
  value?: ReactNode;
};

type StructureNotificationDetailProps = Pick<
  TNotification,
  'action' | 'createdAt' | 'fromUser'
> & {
  contentType: string;
  details: StructureDetailItem[];
  loading: boolean;
  name?: string;
};

const getUserDisplayName = (
  fromUser: StructureNotificationDetailProps['fromUser'],
) => fromUser?.details?.fullName || fromUser?.email || 'Unknown user';

export const StructureNotificationDetail = ({
  action,
  contentType,
  createdAt,
  details,
  fromUser,
  loading,
  name,
}: StructureNotificationDetailProps) => {
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!name) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
            <IconInfoCircle className="size-5" />
          </div>
          <h3 className="text-base font-medium capitalize text-foreground">
            {contentType} not found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This {contentType} may have been removed or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  const visibleDetails = details.filter(
    ({ value }) => value !== undefined && value !== null && value !== '',
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-6 py-8">
      <div className="flex items-start gap-4 border-b pb-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
          <IconBuildings className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {contentType}
          </p>
          <h2 className="mt-1 break-words text-2xl font-semibold text-foreground">
            {name}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {fromUser && (
              <span className="flex items-center gap-1.5">
                <Avatar className="size-5">
                  <Avatar.Image
                    src={readImage(fromUser.details?.avatar || '')}
                    alt={getUserDisplayName(fromUser)}
                  />
                  <Avatar.Fallback className="text-[10px]">
                    {getUserDisplayName(fromUser)[0].toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>
                {getUserDisplayName(fromUser)}
              </span>
            )}
            {action && <span>{action}</span>}
            {createdAt && <RelativeDateDisplay.Value value={createdAt} />}
          </div>
        </div>
      </div>

      <dl className="grid gap-x-8 gap-y-6 py-6 sm:grid-cols-2">
        {visibleDetails.map(({ label, value }) => (
          <div key={label} className="min-w-0 border-b pb-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-1 break-words text-sm text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
