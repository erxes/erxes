import { Button, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Appear, appearStyle } from './Appear';
import type { OnboardingStepDef } from './onboardingSteps';

// Old erxes showed the organization's short name only for custom-branded
// (white-label) installs; the new organization has no such setting yet.
const BRAND_NAME = 'erxes';

export const WelcomeSection = ({ steps, onContinue }: { steps: OnboardingStepDef[]; onContinue: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });
  useScopedHotkeys(`enter`, () => onContinue(), 'welcome');
  useScopedHotkeys(`space`, () => onContinue(), 'welcome');

  const milestoneRows = steps.slice(1);

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Appear y={20} duration={600} delay={100} className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('lets-get-started')}</h1>
        <p className="text-lg text-muted-foreground">{t('brand-ready', { brandName: BRAND_NAME })}</p>
      </Appear>

      <ul className="flex flex-col rounded-xl border bg-background px-4 shadow-xs">
        {milestoneRows.map(({ step, cardTitle, cardSubtitle, icon: Icon }, index) => (
          <li
            key={step}
            className="flex items-center gap-4 border-b py-4 last:border-b-0 animate-in"
            // Staggered like the old list variants
            style={appearStyle({ y: 12, duration: 400, delay: 300 + index * 80 })}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-base font-semibold text-foreground">{cardTitle}</span>
              <span className="text-xs text-muted-foreground">{cardSubtitle}</span>
            </span>
          </li>
        ))}
      </ul>

      <Appear y={12} duration={500} delay={600} className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{t('takes-few-minutes')}</p>
        <Button size="lg" className="w-full" onClick={onContinue} autoFocus>
          {t('get-started')}
        </Button>
        <p className="text-xs text-muted-foreground">
          Press
          <kbd className="mx-1 rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
            Enter
          </kbd>
          to continue
        </p>
      </Appear>
    </div>
  );
};
