import { IconCheck } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { Appear } from './Appear';
import type { OnboardingStepDef } from './onboardingSteps';

export const OnboardingStepItem = ({
  step,
  isSelected,
  isChecked,
  onSelect,
}: {
  step: OnboardingStepDef;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: (step: number) => void;
}) => {
  const Icon = step.icon;

  return (
    <Appear
      y={100}
      delay={100}
      duration={500}
      easing="ease-in-out"
      className="flex w-full flex-row gap-4"
    >
      <div
        className={cn(
          'flex items-center justify-center transition duration-300 ease-spring',
          isChecked ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
        )}
      >
        <div className="rounded-lg bg-success p-2 text-white">
          <IconCheck className="h-6 w-6" />
        </div>
      </div>
      <button
        type="button"
        aria-disabled={!isChecked}
        className={cn(
          'flex flex-1 flex-row gap-4 rounded-xl p-2 pr-12 text-left transition duration-300 ease-spring',
          isSelected ? 'scale-100 bg-muted-foreground/20' : 'scale-90 bg-transparent',
          isChecked ? 'cursor-pointer' : 'cursor-default',
        )}
        onClick={() => isChecked && onSelect(step.step)}
      >
        <span className="flex size-12 items-center justify-center rounded-lg bg-muted-foreground/30 p-2 text-white">
          <Icon className="h-6 w-6" />
        </span>
        <span className="flex flex-col gap-0.5">
          <span
            className={cn(
              'block text-base font-semibold transition-colors',
              isSelected ? 'text-white' : 'text-white/90',
            )}
          >
            {step.title}
          </span>
          <span
            className={cn(
              'text-xs leading-relaxed font-normal transition-colors',
              isSelected ? 'text-white/70' : 'text-white/50',
            )}
          >
            {step.subtitle}
          </span>
        </span>
      </button>
    </Appear>
  );
};
