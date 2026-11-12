import { IconCheck } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { appearStyle, EASE_SPRING } from './Appear';
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
    <div
      className="flex w-full flex-row gap-4 animate-in"
      style={appearStyle({ y: 100, delay: 100, duration: 500, easing: 'ease-in-out' })}
    >
      <div
        className={cn(
          'flex items-center justify-center transition-[opacity,transform] duration-300',
          isChecked ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
        )}
        style={{ transitionTimingFunction: EASE_SPRING }}
      >
        <div className="rounded-lg bg-green-400 p-2 text-white">
          <IconCheck className="h-6 w-6" />
        </div>
      </div>
      <button
        type="button"
        aria-disabled={!isChecked}
        className={cn(
          'flex flex-1 flex-row gap-4 rounded-xl p-2 pr-12 text-left transition-[transform,background-color] duration-300',
          isSelected ? 'scale-100 bg-gray-500/20' : 'scale-90 bg-transparent',
          isChecked ? 'cursor-pointer' : 'cursor-default',
        )}
        style={{ transitionTimingFunction: EASE_SPRING }}
        onClick={() => isChecked && onSelect(step.step)}
      >
        <span className="flex h-[48px] w-[48px] items-center justify-center rounded-lg bg-gray-400/30 p-2 text-white">
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
    </div>
  );
};
