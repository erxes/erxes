import {
  TemplateEmpty,
  TemplateError,
  TemplateLoading,
} from '@/template/components/TemplateStateViews';
import { useTemplateInstallations } from '@/template/hooks/useTemplateInstallations';
import { IconChevronRight } from '@tabler/icons-react';
import { Badge, Card } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export const TemplateInstallationsList = () => {
  const { t } = useTranslation('templates');
  const { installations, loading, error } = useTemplateInstallations();

  if (loading) {
    return <TemplateLoading />;
  }

  if (error) {
    return <TemplateError message={error.message} />;
  }

  if (!installations.length) {
    return (
      <TemplateEmpty
        title={t('no-installations')}
        description={t('no-installations-body')}
      />
    );
  }

  return (
    <Card className="m-5 divide-y">
      {installations.map((installation) => {
        const automations = installation.automations || [];
        const active = automations.filter(
          ({ status }) => status === 'active',
        ).length;

        return (
          <Link
            key={installation._id}
            to={`/templates/installations/${installation._id}`}
            className="flex items-center gap-4 p-4 hover:bg-accent"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium">{installation.name}</p>
              <p className="text-xs text-muted-foreground">
                {t('installed-at', {
                  date: new Date(installation.createdAt).toLocaleString(),
                  version: installation.version,
                })}
              </p>
            </div>
            <Badge
              variant={
                active === automations.length && active
                  ? 'success'
                  : 'secondary'
              }
            >
              {t('active-of', { active, total: automations.length })}
            </Badge>
            <IconChevronRight className="size-4 text-muted-foreground" />
          </Link>
        );
      })}
    </Card>
  );
};
