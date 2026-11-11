import { useRemoveTemplateInstallation } from '@/template/hooks/useTemplateInstallations';
import { TTemplateInstallation } from '@/template/types';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { IconExternalLink, IconRobot, IconSitemap } from '@tabler/icons-react';
import { Badge, Button, Card } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Can } from 'ui-modules';

/**
 * What one install created. Each automation is opened and switched on in the
 * builder, where its preflight runs; removal is closed while any is live.
 */
export const TemplateInstallationDetail = ({
  installation,
}: {
  installation: TTemplateInstallation;
}) => {
  const { t } = useTranslation('templates');
  const { removeInstallation, loading } = useRemoveTemplateInstallation();
  const automations = installation.automations || [];
  const hasActive = automations.some(({ status }) => status === 'active');

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 overflow-y-auto p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{installation.name}</h2>
        <p className="text-sm text-muted-foreground">
          {t('installed-at', {
            date: new Date(installation.createdAt).toLocaleString(),
            version: installation.version,
          })}
        </p>
      </div>

      <Card className="divide-y">
        <p className="p-4 text-sm font-semibold">{t('created-automations')}</p>
        {automations.map((automation) => (
          <div key={automation._id} className="flex items-center gap-3 p-4">
            <IconSitemap className="size-4 text-muted-foreground" />
            <span className="min-w-0 flex-1 text-sm">{automation.name}</span>
            <Badge
              variant={automation.status === 'active' ? 'success' : 'secondary'}
            >
              {t(`status-${automation.status}`, automation.status)}
            </Badge>
            <Button variant="ghost" asChild>
              <Link to={`/automations/edit/${automation._id}`}>
                {t('open')}
                <IconExternalLink />
              </Link>
            </Button>
          </div>
        ))}
        {!automations.length && (
          <p className="p-4 text-sm text-muted-foreground">
            {t('automations-gone')}
          </p>
        )}
      </Card>

      {Object.values(installation.partIds || {}).map((agentId) => (
        <Card key={agentId} className="flex items-center gap-3 p-4">
          <IconRobot className="size-4 text-muted-foreground" />
          <span className="flex-1 text-sm">{t('ai-agent')}</span>
          <Button variant="ghost" asChild>
            <Link to={`${AutomationSettingsPath.Agents}/${agentId}`}>
              {t('open-settings')}
              <IconExternalLink />
            </Link>
          </Button>
        </Card>
      ))}

      <p className="text-sm text-muted-foreground">{t('activate-note')}</p>

      <Can action="templatesInstall">
        <div className="space-y-1">
          <Button
            variant="destructive"
            disabled={hasActive || loading}
            onClick={() => removeInstallation(installation)}
          >
            {t('remove')}
          </Button>
          {hasActive && (
            <p className="text-xs text-muted-foreground">
              {t('remove-blocked')}
            </p>
          )}
        </div>
      </Can>
    </div>
  );
};
