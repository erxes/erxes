import { Badge, Label, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { StructureEntityBadge } from 'ui-modules';
import { useProfileStructureMemberships } from '@/settings/profile/hooks/useProfileStructureMemberships';
import { getMembershipSeatLabels } from '@/settings/team-member/utils/structureMemberships';

export const ProfileStructureMemberships = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { memberships, loading, error } = useProfileStructureMemberships();

  const renderContent = () => {
    if (loading && memberships.length === 0) {
      return <Skeleton className="h-8 w-full" />;
    }

    if (error) {
      return <p className="text-sm text-destructive">{error.message}</p>;
    }

    if (memberships.length === 0) {
      return <p className="text-sm text-muted-foreground">{t('not-placed')}</p>;
    }

    return (
      <ul className="flex flex-col gap-2">
        {memberships.map((membership) => (
          <li
            key={membership._id}
            className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2"
          >
            <StructureEntityBadge
              entity={membership.entity}
              entityId={membership.entityId}
              showMissingId
              variant="secondary"
            />
            {membership.entity?.type?.name && (
              <span className="text-xs text-muted-foreground">
                {membership.entity.type.name}
              </span>
            )}
            {getMembershipSeatLabels(membership).map((label) => (
              <Badge key={label} variant="info">
                {label}
              </Badge>
            ))}
            {membership.isPrimary && (
              <Badge variant="success" className="ml-auto">
                {t('primary')}
              </Badge>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <Label>{t('structure')}</Label>
      <p className="text-xs text-accent-foreground">
        {t('structure-description')}
      </p>
      {renderContent()}
    </div>
  );
};
