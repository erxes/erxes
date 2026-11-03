import type { TablerIcon } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader, SIDE_PANEL_CHAT_PATH, useSidePanel } from 'ui-modules';

/** Assistant › Settings › <page> breadcrumb shared by the agent settings pages. */
export const AgentSettingsPageHeader = ({
  icon: Icon,
  iconName,
  title,
  favoriteTitle,
}: {
  icon: TablerIcon;
  /** The icon's export name, stored with the favorite. */
  iconName: string;
  title: string;
  /** Untranslated page name stored with the favorite. */
  favoriteTitle: string;
}) => {
  const { openPath } = useSidePanel();
  const { t } = useTranslation('common', { keyPrefix: 'agent' });

  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button
                variant="ghost"
                onClick={() => openPath(SIDE_PANEL_CHAT_PATH)}
              >
                <Icon />
                {t('assistant', 'Assistant')}
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/agent">{t('settings', 'Settings')}</Link>
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <span className="text-muted-foreground">{title}</span>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton
          breadcrumb={['AI Agent', 'Settings', favoriteTitle]}
          icon={iconName}
        />
      </PageHeader.Start>
    </PageHeader>
  );
};
