import { IconLifebuoy } from '@tabler/icons-react';
import { Badge, BadgeProps, RelativeDateDisplay } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import {
  ISupportGrant,
  TSupportGrantStatus,
} from '@/settings/support-access/types';
import { grantEndedAt } from '@/settings/support-access/utils';

const STATUS_BADGE: Record<TSupportGrantStatus, BadgeProps['variant']> = {
  pending: 'warning',
  approved: 'success',
  denied: 'secondary',
  revoked: 'destructive',
  expired: 'secondary',
};

const GrantTime = ({ label, value }: { label: string; value: string }) => (
  <span>
    {label}{' '}
    <RelativeDateDisplay value={value}>
      <RelativeDateDisplay.Value value={value} />
    </RelativeDateDisplay>
  </span>
);

export const SupportAccessGrantRow = ({
  grant,
  children,
}: {
  grant: ISupportGrant;
  children?: ReactNode;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'support-access' });
  const endedAt = grantEndedAt(grant);

  return (
    <li className="flex items-start gap-3 rounded-lg border p-4">
      <IconLifebuoy className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{grant.staffName}</span>
          <Badge variant={STATUS_BADGE[grant.status]}>
            {t(`status-${grant.status}`)}
          </Badge>
          {grant.autoApproved && (
            <Badge variant="secondary">{t('auto-approved')}</Badge>
          )}
        </div>
        <p className="text-sm">{grant.reason}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <GrantTime label={t('requested')} value={grant.createdAt} />
          {endedAt && (
            <GrantTime
              label={t(grant.status === 'approved' ? 'ends' : 'ended')}
              value={endedAt}
            />
          )}
          {!!grant.visits.length && (
            <span>{t('visits', { count: grant.visits.length })}</span>
          )}
          {grant.decidedBy && <MembersInline memberIds={[grant.decidedBy]} />}
        </div>
      </div>
      {children}
    </li>
  );
};
