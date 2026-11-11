import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useTeamMembers } from '../useTeamMembers';

export function TeamMemberCounts() {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { totalCount, loading } = useTeamMembers();

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {totalCount !== undefined
        ? t('records-found', { totalCount })
        : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
    </div>
  );
}
