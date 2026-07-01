import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

export const AutomationSettingsSidebar = () => {
  const { t } = useTranslation('automations');
  const activePath = useLocation().pathname;

  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={activePath.includes('/settings/automations/agents')}
                asChild
              >
                <Link to={`/settings/automations/agents`}>{t('agents', 'Agents')}</Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={activePath.includes(
                  '/settings/automations/email-templates',
                )}
                asChild
              >
                <Link to={`/settings/automations/email-templates`}>
                  {t('email-templates', 'Email Templates')}
                </Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={activePath.includes('/settings/automations/bots')}
                asChild
              >
                <Link to={`/settings/automations/bots`}>{t('bots', 'Bots')}</Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
