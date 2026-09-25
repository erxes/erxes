import { AutomationOwnershipHandover } from '@/automations/components/builder/header/AutomationOwnershipHandover';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { TAutomationUser } from '@/automations/types';
import { IconUserCheck } from '@tabler/icons-react';
import { Avatar, Badge, Popover, readImage } from 'erxes-ui';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const nameOf = (user?: TAutomationUser) =>
  user?.details?.fullName || user?.email || 'Unknown';

const UserRow = ({ label, user }: { label: string; user?: TAutomationUser }) =>
  user ? (
    <div className="flex items-center justify-between gap-6">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-sm">
        <Avatar className="size-5 rounded-full">
          <Avatar.Image
            src={readImage(user.details?.avatar)}
            alt={nameOf(user)}
          />
          <Avatar.Fallback className="text-[10px]">
            {nameOf(user).charAt(0)}
          </Avatar.Fallback>
        </Avatar>
        {nameOf(user)}
      </span>
    </div>
  ) : null;

/**
 * Who the automation acts for, said where it is built. Authorship sits behind
 * the same popover but apart from it: editing a flow is not answering for it.
 */
export const AutomationOwnerBadge = () => {
  const { detail } = useAutomation();
  const { t } = useTranslation('automations');
  const owner = detail?.ownerUser;

  if (!owner) {
    return null;
  }

  const activatedAt = detail?.activatedAt;
  const taken = !!detail?.ownerId;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Badge variant="secondary" className="shrink-0 cursor-pointer gap-1.5">
          <IconUserCheck className="size-3.5" />
          {nameOf(owner)}
        </Badge>
      </Popover.Trigger>
      <Popover.Content className="w-72 p-3">
        <div className="flex flex-col gap-2">
          <UserRow label={t('owner')} user={owner} />
          <p className="text-xs text-muted-foreground">
            {taken
              ? t('owner-description', {
                  when: activatedAt
                    ? dayjs(activatedAt).format('YYYY-MM-DD HH:mm')
                    : '',
                })
              : t('owner-not-taken')}
          </p>
          <div className="mt-1 border-t pt-2">
            <AutomationOwnershipHandover
              automationId={detail?._id}
              automationName={detail?.name}
            />
          </div>
          <div className="mt-1 flex flex-col gap-1.5 border-t pt-2">
            <UserRow label={t('created-user')} user={detail?.createdUser} />
            <UserRow label={t('updated-user')} user={detail?.updatedUser} />
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
};
