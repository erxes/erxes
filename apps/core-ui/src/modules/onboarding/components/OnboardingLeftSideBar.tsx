import { BackgroundGradientAnimation } from 'erxes-ui';
import { useState } from 'react';
import { Logo } from '~/modules/auth/components/Logo';
import { appearStyle } from './Appear';
import { OnboardingStepItem } from './OnboardingStepItem';
import { getOnboardingStepForScreen, type OnboardingStepDef } from './onboardingSteps';

export const OnboardingLeftSideBar = ({
  steps,
  currentStep,
  onSelectStep,
}: {
  steps: OnboardingStepDef[];
  currentStep: number;
  onSelectStep: (step: number) => void;
}) => {
  // The step it came from decides the side the new one slides in from.
  const [shown, setShown] = useState({ step: currentStep, direction: 1 });

  if (shown.step !== currentStep) {
    setShown({ step: currentStep, direction: currentStep > shown.step ? 1 : -1 });
  }

  const { direction } = shown;
  const current = getOnboardingStepForScreen(steps, currentStep);

  return (
    <>
      <BackgroundGradientAnimation containerClassName="hidden lg:flex" className="gap-8">
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
          {/* Keyed by step, so each change slides in from the side it came */}
          {current && (
            <div
              key={currentStep}
              className="flex flex-col items-center justify-center animate-in"
              style={appearStyle({ x: direction > 0 ? 48 : -48, duration: 160 })}
            >
              <div className="flex h-[48px] w-[48px] items-center justify-center rounded-lg bg-gray-400/30 p-2 text-white">
                <current.icon className="h-6 w-6" />
              </div>
              <h4 className="mt-3 max-w-[280px] text-center text-xl leading-tight text-white">
                {current.title}
              </h4>
              <span className="mt-1 block max-w-[320px] text-center text-xs leading-5 text-white/70">
                {current.subtitle}
              </span>
            </div>
          )}
        </div>
      </BackgroundGradientAnimation>
    </>
  );
};
