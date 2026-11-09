import { TeamMembersPath } from '@/settings/team-member/constants/teamMemberRoutes';
import { IconUsers } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const MemberPanelBreadcrumb = ({ title }: { title: ReactNode }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  return (
    <Breadcrumb className="min-w-0 pl-[var(--navigation-panel-toggle-space,0rem)]">
      <Breadcrumb.List className="min-w-0 flex-nowrap gap-1">
        <Breadcrumb.Item className="shrink-0">
          <Button variant="ghost" asChild>
            <Link to={`${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`}>
              <IconUsers />
              {t('team-members', 'Team members')}
            </Link>
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item className="min-w-0">
          <Breadcrumb.Page className="block max-w-64 truncate px-3 py-1 leading-5">
            {title}
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
