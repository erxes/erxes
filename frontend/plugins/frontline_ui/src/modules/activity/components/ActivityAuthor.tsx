import { IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CustomersInline, MembersInline } from 'ui-modules';

const CLIENT_PORTAL_PREFIX = 'cp:';

export const activityCustomerId = (createdBy?: string | null) =>
  createdBy?.startsWith(CLIENT_PORTAL_PREFIX)
    ? createdBy.slice(CLIENT_PORTAL_PREFIX.length)
    : '';

export const ActivityAuthorAvatar = ({
  createdBy,
}: {
  createdBy?: string | null;
}) => {
  const customerId = activityCustomerId(createdBy);

  if (customerId) {
    return (
      <CustomersInline.Provider customerIds={[customerId]}>
        <CustomersInline.Avatar />
      </CustomersInline.Provider>
    );
  }

  if (!createdBy) {
    return (
      <div className="size-5 rounded-full bg-muted flex items-center justify-center">
        <IconUser className="size-3 text-muted-foreground" />
      </div>
    );
  }

  return (
    <MembersInline.Provider memberIds={[createdBy]}>
      <MembersInline.Avatar />
    </MembersInline.Provider>
  );
};

export const ActivityAuthorName = ({
  createdBy,
  className,
}: {
  createdBy?: string | null;
  className?: string;
}) => {
  const { t } = useTranslation('frontline');
  const customerId = activityCustomerId(createdBy);

  if (customerId) {
    return (
      <CustomersInline.Provider
        customerIds={[customerId]}
        placeholder={t('unnamed-customer', 'Unnamed customer')}
        hideAvatar
      >
        <CustomersInline.Title className={className} />
      </CustomersInline.Provider>
    );
  }

  if (!createdBy) {
    return (
      <span className="text-muted-foreground">{t('unknown', 'Unknown')}</span>
    );
  }

  return (
    <MembersInline.Provider memberIds={[createdBy]}>
      <MembersInline.Title className={className} />
    </MembersInline.Provider>
  );
};
