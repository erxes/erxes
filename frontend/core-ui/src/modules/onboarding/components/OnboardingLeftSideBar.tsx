import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { BackgroundGradientAnimation } from 'erxes-ui';
import { Logo } from '@/auth/components/Logo';
import type { OnboardingStepDef } from './onboardingSteps';
import { OnboardingStepItem } from './OnboardingStepItem';
import { getOnboardingStepForScreen } from './onboardingSteps';

const mobileStepVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 48 : -48,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -48 : 48,
  }),
};

export const OnboardingLeftSideBar = ({
  steps,
  currentStep,
  onSelectStep,
}: {
  steps: OnboardingStepDef[];
  currentStep: number;
  onSelectStep: (step: number) => void;
}) => {
  const [direction, setDirection] = useState(1);
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    if (currentStep === prevStepRef.current) {
      return;
    }

    setDirection(currentStep > prevStepRef.current ? 1 : -1);
    prevStepRef.current = currentStep;
  }, [currentStep]);

  const current = getOnboardingStepForScreen(steps, currentStep);
  const CurrentIcon = current.icon;

  return (
    <>
      <BackgroundGradientAnimation
        containerClassName="hidden lg:flex"
        className="gap-8"
      >
        <div className="flex flex-none flex-row items-center justify-between">
          <Logo className="h-8 text-primary-foreground" />
        </div>

        <div className="flex flex-1 items-center justify-center px-12">
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            {steps.map((step) => (
              <OnboardingStepItem
                key={step.step}
                step={step}
                isSelected={currentStep === step.step}
                isChecked={currentStep > step.step}
                onSelect={onSelectStep}
              />
            ))}
          </div>
        </div>
      </BackgroundGradientAnimation>

      <BackgroundGradientAnimation
        containerClassName="lg:hidden min-h-[220px] w-full overflow-hidden"
        className="justify-center"
      >
        <div className="flex w-full justify-center px-5 py-4 md:px-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={mobileStepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center"
            >
              <div className="flex h-[48px] w-[48px] items-center justify-center rounded-lg bg-gray-400/30 p-2 text-white">
                <CurrentIcon className="h-6 w-6" />
              </div>
              <h4 className="mt-3 max-w-[280px] text-center text-xl leading-tight text-white">
                {current.title}
              </h4>
              <span className="mt-1 block max-w-[320px] text-center text-xs leading-5 text-white/70">
                {current.subtitle}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </BackgroundGradientAnimation>
    </>
  );
};
