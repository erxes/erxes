import { TemplateProgressRing } from '@/template/components/wizard/TemplateProgressRing';
import { useTemplateInstallationView } from '@/template/hooks/useTemplateInstallationView';
import { useRemoveTemplateInstallation } from '@/template/hooks/useTemplateInstallations';
import { TTemplateInstallation } from '@/template/types';
import {
  IconArrowRight,
  IconCircleCheckFilled,
  IconExternalLink,
} from '@tabler/icons-react';
import { Badge, Button, cn, IconComponent } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Can } from 'ui-modules';

const SectionTitle = ({ children }: { children: string }) => (
  <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
    {children}
  </h2>
);

/**
 * What one install created, as the next thing to do: each automation is a
 * draft to open and switch on in the builder, where its preflight runs.
 * Straight after installing, the top says so. Removal waits until none is on.
 */
export const TemplateInstallationDetail = ({
  installation,
}: {
  installation: TTemplateInstallation;
}) => {
  const { t } = useTranslation('templates');
  const { removeInstallation, loading } = useRemoveTemplateInstallation();
  const { icon, justInstalled, automations, parts, activeCount } =
    useTemplateInstallationView(installation);
  const hasActive = activeCount > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-5">
        <section className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-primary/20 via-primary/10 to-primary/5 p-6">
          <span className="absolute -left-10 -top-16 size-40 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span
                className={cn(
                  'flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm',
                  justInstalled
                    ? 'bg-success text-white'
                    : 'bg-primary text-primary-foreground',
                )}
              >
                {justInstalled ? (
                  <IconCircleCheckFilled className="size-7" />
                ) : (
                  <IconComponent name={icon} className="size-6" />
                )}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="text-xl font-semibold tracking-tight">
                  {justInstalled
                    ? t('installed-title', { name: installation.name })
                    : installation.name}
                </h1>
                <p className="max-w-prose text-sm text-muted-foreground">
                  {t('activate-note')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('installed-at', {
                    date: new Date(installation.createdAt).toLocaleString(),
                    version: installation.version,
                  })}
                </p>
              </div>
            </div>
            {automations.length > 0 && (
              <div className="flex shrink-0 items-center gap-3 rounded-xl bg-background/70 px-4 py-3">
                <TemplateProgressRing
                  done={activeCount}
                  total={automations.length}
                />
                <span className="text-sm font-medium">
                  {t('active-of', {
                    active: activeCount,
                    total: automations.length,
                  })}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <SectionTitle>{t('created-automations')}</SectionTitle>
          {automations.map((automation) => {
            const isActive = automation.status === 'active';

            return (
              <div
                key={automation._id}
                className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3"
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    isActive
                      ? 'bg-success/15 text-success'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <IconComponent
                    name={automation.icon || 'IconSitemap'}
                    className="size-4"
                  />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {automation.shortName}
                  </span>
                  {automation.description && (
                    <span className="truncate text-xs text-muted-foreground">
                      {automation.description}
                    </span>
                  )}
                </span>
                <Badge
                  variant={isActive ? 'success' : 'secondary'}
                  className="shrink-0"
                >
                  {t(`status-${automation.status}`, automation.status)}
                </Badge>
                <Button
                  variant={isActive ? 'ghost' : 'secondary'}
                  className="shrink-0"
                  asChild
                >
                  <Link to={`/automations/edit/${automation._id}`}>
                    {isActive ? t('open') : t('review-and-switch-on')}
                    <IconArrowRight />
                  </Link>
                </Button>
              </div>
            );
          })}
          {!automations.length && (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              {t('automations-gone')}
            </p>
          )}
        </section>

        {parts.length > 0 && (
          <section className="flex flex-col gap-2">
            <SectionTitle>{t('created-parts')}</SectionTitle>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {parts.map((part) => (
                <div
                  key={part.key}
                  className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconComponent name={part.icon} className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {part.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {part.isAgent ? t('ai-agent') : part.kind}
                    </span>
                  </span>
                  {part.href && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={part.href} aria-label={t('open-settings')}>
                        <IconExternalLink />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <Can action="templatesInstall">
          <section className="flex flex-col items-start gap-2 rounded-xl border border-destructive/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {hasActive ? t('remove-blocked') : t('remove-hint')}
            </p>
            <Button
              variant="destructive"
              className="shrink-0"
              disabled={hasActive || loading}
              onClick={() => removeInstallation(installation)}
            >
              {t('remove')}
            </Button>
          </section>
        </Can>
      </div>
    </div>
  );
};
