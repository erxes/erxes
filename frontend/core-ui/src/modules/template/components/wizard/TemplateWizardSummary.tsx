import { TemplateProgressRing } from '@/template/components/wizard/TemplateProgressRing';
import { useTemplateWizardContext } from '@/template/context/TemplateWizardContext';
import { templateJourneyShortName } from '@/template/utils/templateWizard';
import { IconRocket } from '@tabler/icons-react';
import { Button, cn, IconComponent, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const AI_AGENT_PART = 'automations:aiAgent';

const TemplateInstallButton = ({ className }: { className?: string }) => {
  const { t } = useTranslation('templates');
  const { remaining, submit, installing } = useTemplateWizardContext();

  return (
    <Button
      size="lg"
      className={className}
      disabled={!!remaining || installing}
      onClick={submit}
    >
      <IconRocket />
      {installing ? t('installing') : t('install')}
    </Button>
  );
};

// How far along the answers are, as a ring and a line
const TemplateWizardProgress = ({ className }: { className?: string }) => {
  const { t } = useTranslation('templates');
  const { done, total, remaining } = useTemplateWizardContext();

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <TemplateProgressRing done={done} total={total} />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">
          {remaining ? t('ready-count', { done, total }) : t('ready-to-install')}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {remaining ? t('steps-left', { count: remaining }) : t('all-answered')}
        </span>
      </div>
    </div>
  );
};

/** Progress, the install button and everything the install creates. */
export const TemplateWizardSummary = () => {
  const { t } = useTranslation('templates');
  const { template } = useTemplateWizardContext();

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border bg-background p-5 shadow-xs">
      <div className="hidden flex-col gap-4 lg:flex">
        <TemplateWizardProgress />
        <TemplateInstallButton className="w-full" />
        <p className="text-xs text-muted-foreground">{t('install-note')}</p>
        <Separator />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t('will-create')}
      </p>
      <ul className="flex flex-col gap-3">
        {template?.parts.map((part) => {
          const isAgent = part.type === AI_AGENT_PART;

          return (
            <li key={part.key} className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconComponent
                  name={isAgent ? 'IconRobot' : part.icon || 'IconBox'}
                  className="size-4"
                />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm">
                  {part.name || part.label}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {isAgent ? t('ai-agent') : part.label}
                </span>
              </span>
            </li>
          );
        })}
        {template?.journeys.map((journey) => (
          <li key={journey.key} className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <IconComponent
                name={journey.preview?.trigger.icon || 'IconSitemap'}
                className="size-4"
              />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm">
                {templateJourneyShortName(journey.name, template?.name)}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {t('draft-steps', { count: journey.stepCount })}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

/** Progress and install kept in reach at the bottom on narrow screens. */
export const TemplateWizardMobileBar = () => (
  <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t bg-background/90 px-5 py-3 backdrop-blur lg:hidden">
    <TemplateWizardProgress className="flex-1" />
    <TemplateInstallButton />
  </div>
);
