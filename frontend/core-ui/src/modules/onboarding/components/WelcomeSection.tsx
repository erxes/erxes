import { Button, useScopedHotkeys } from 'erxes-ui';

import type { OnboardingStepDef } from './onboardingSteps';
import { currentOrganizationState } from 'ui-modules';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export const WelcomeSection = ({
  steps,
  onContinue,
}: {
  steps: OnboardingStepDef[];
  onContinue: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });
  useScopedHotkeys(`enter`, () => onContinue(), 'welcome');
  useScopedHotkeys(`space`, () => onContinue(), 'welcome');

  const organization = useAtomValue(currentOrganizationState);
  const brandName = organization?.orgCustomOnboarding
    ? organization?.orgShortName
    : 'erxes';

  const milestoneRows = steps.slice(1);

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('lets-get-started')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('brand-ready', { brandName })}
        </p>
      </motion.div>

      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col rounded-xl border bg-background px-4 shadow-xs"
      >
        {milestoneRows.map(({ step, cardTitle, cardSubtitle, icon: Icon }) => (
          <motion.li
            key={step}
            variants={rowVariants}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center gap-4 border-b py-4 last:border-b-0"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-base font-semibold text-foreground">
                {cardTitle}
              </span>
              <span className="text-xs text-muted-foreground">
                {cardSubtitle}
              </span>
            </span>
          </motion.li>
        ))}
      </motion.ul>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col gap-4"
      >
        <p className="text-sm text-muted-foreground">
          {t('takes-few-minutes')}
        </p>
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
      </motion.div>
    </div>
  );
};
