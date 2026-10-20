import { motion } from 'framer-motion';
import { WelcomeOnboardingGrid } from 'ui-modules/modules/notifications/components/WelcomeOnboardingGrid';
import type { WelcomeOnboardingStepsSectionProps } from 'ui-modules/modules/notifications/types/welcome';

export const WelcomeOnboardingStepsSection = ({
  isOwner,
  onboardingSteps,
}: WelcomeOnboardingStepsSectionProps) => {
  const filteredSteps = onboardingSteps.filter(
    (item) => !item.forOwner || isOwner,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="max-w-4xl w-full items-center mx-auto"
    >
      <h2 className="text-xl font-semibold text-center mb-6">Get Started</h2>
      <div className="p-2 rounded-3xl border bg-muted">
        <WelcomeOnboardingGrid items={filteredSteps} />
      </div>
    </motion.div>
  );
};
