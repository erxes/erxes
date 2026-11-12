import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSession } from '~/modules/auth/session';
import { useHomeTeamMembers } from '../hooks';
import { HOME_NS } from '../i18n';
import { HomeRecordList } from './HomeRecordList';
import { useRoles } from '~/modules/settings/roles/useRoles';

/** Team members with their role; invited and disabled ones are marked. */
export const HomeTeamMembers = () => {
  const { roleName } = useRoles();
  const { t } = useTranslation(HOME_NS);
  const { user: me } = useSession();
  const { data, isPending, isError } = useHomeTeamMembers();
  const members = data?.data ?? [];

  return (
    <HomeRecordList
      title={t('widgets.team-members')}
      viewAllTo="/settings/team-members"
      emptyLabel={t('empty.team')}
      loading={isPending}
      error={isError}
      // Alone in the organization, the list would only show the user
      rows={(members.length === 1 && members[0]?.id === me.id ? [] : members).map((member) => ({
        id: member.id,
        name: member.fullName || member.username || member.email,
        avatarUrl: member.avatarUrl,
        detail: member.fullName ? member.email : null,
        meta:
          member.status === 'active' ? (
            roleName(member.role)
          ) : (
            <Badge variant={member.status === 'disabled' ? 'destructive' : 'secondary'}>
              {t(`status.${member.status}`)}
            </Badge>
          ),
        to: '/settings/team-members',
      }))}
    />
  );
};
