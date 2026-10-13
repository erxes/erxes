import { IconCheck } from '@tabler/icons-react';
import type { OnboardingStepDef } from './onboardingSteps';
import { cn } from 'erxes-ui';
import { motion } from 'framer-motion';

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
    <motion.div
      className="flex w-full flex-row gap-4"
      initial={{ opacity: 0.5, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.1,
        duration: 0.5,
        ease: 'easeInOut',
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: isChecked ? 1 : 0, opacity: isChecked ? 1 : 0 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        className={`flex items-center justify-center ${
          !isChecked ? 'opacity-0' : ''
        }`}
      >
        <div className={`rounded-lg bg-green-400 p-2 text-white`}>
          <IconCheck className="h-6 w-6" />
        </div>
      </motion.div>
      <motion.div
        className={cn(`flex flex-1 flex-row gap-4 rounded-xl p-2 pr-12`, {
          'cursor-pointer': isChecked,
        })}
        onClick={() => (isChecked ? onSelect(step.step) : '')}
        animate={{
          scale: isSelected ? 1 : 0.9,
          backgroundColor: isSelected
            ? 'rgba(107, 114, 128, 0.2)'
            : 'transparent',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      >
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-lg bg-gray-400/30 p-2 text-white">
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        <div className="flex flex-col gap-0.5">
          <p
            className={cn(
              'text-base font-semibold transition-colors',
              isSelected ? 'text-white' : 'text-white/90',
            )}
          >
            {step.title}
          </p>
          <span
            className={cn(
              'text-xs leading-relaxed font-normal transition-colors',
              isSelected ? 'text-white/70' : 'text-white/50',
            )}
          >
            {step.subtitle}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
