import { IconUsers } from '@tabler/icons-react';
import { Breadcrumb, buttonVariants } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TEAM_MEMBERS_PATH } from '../constants';

export const MemberPanelBreadcrumb = ({ title }: { title: ReactNode }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    // Room for the app sidebar's expand button while the sidebar is collapsed.
    <div className="min-w-0 navigation-collapsed:pl-10">
      <Breadcrumb>
        <Breadcrumb.List className="min-w-0 flex-nowrap">
          <Breadcrumb.Item className="shrink-0">
            <Link to={TEAM_MEMBERS_PATH} className={buttonVariants({ variant: 'ghost' })}>
              <IconUsers />
              {t('team-members', 'Team members')}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item className="min-w-0">
            <Breadcrumb.Page variant="text" className="block max-w-64">
              {title}
            </Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
    </div>
  );
};
