import React from 'react';
import { Stepper } from 'erxes-ui';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import {
  StepperItemProps,
  ValidationAlertProps,
  VerticalStepperProps,
} from '@/pos/pos-detail/types/IPosLayout';
import { LAYOUT, navigateToTab } from '@/pos/constants';

export const StepperItem = React.memo(
  ({ step, currentStep, isClickable }: StepperItemProps) => (
    <Stepper.Item
      step={step.id}
      completed={currentStep > step.id}
      className="relative mb-12 last:mb-0"
    >
      <Stepper.Trigger
        className={`flex items-center gap-4 w-full text-left
        ${step.id === currentStep ? 'opacity-100' : 'opacity-60'}
        ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
        ${currentStep > step.id ? 'text-blue-600' : ''}`}
        disabled={!isClickable}
        aria-label={`Step ${step.id}: ${step.title}`}
        aria-current={step.id === currentStep ? 'step' : undefined}
      >
        <Stepper.Indicator className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium shadow-sm border border-gray-200 data-[state=completed]:border-blue-500 data-[state=completed]:shadow-blue-100">
          {currentStep > step.id ? <IconCheck className="h-4 w-4" /> : step.id}
        </Stepper.Indicator>
        <span
          className={`text-base font-medium ${
            currentStep > step.id ? 'text-blue-600' : ''
          }`}
        >
          {step.title}
        </span>
      </Stepper.Trigger>
      {step.id < (step.totalSteps || 0) && (
        <Stepper.Separator
          className={`absolute ${LAYOUT.STEPPER_INDICATOR_LEFT} ${LAYOUT.STEPPER_SEPARATOR_TOP} ${LAYOUT.STEPPER_SEPARATOR_HEIGHT} -translate-x-1/2 group-data-[state=completed]/step:bg-blue-500`}
        />
      )}
    </Stepper.Item>
  ),
);

export const VerticalStepper = React.memo(
  ({
    steps,
    currentStepId,
    hasCategorySelected,
    searchParams,
    setSearchParams,
  }: VerticalStepperProps) => {
    const handleStepChange = (stepId: number): void => {
      if (
        (stepId === currentStepId + 1 || stepId === currentStepId - 1) &&
        (stepId === 1 || hasCategorySelected)
      ) {
        const targetStep = steps.find((step) => step.id === stepId);
        if (targetStep) {
          navigateToTab(setSearchParams, searchParams, targetStep.value);
        }
      }
    };

    return (
      <div
        className={`${LAYOUT.STEPPER_WIDTH} border-r bg-gray-50 p-5 overflow-y-auto`}
      >
        <Stepper
          value={currentStepId}
          onValueChange={handleStepChange}
          orientation="vertical"
          className="w-full"
        >
          {steps.map((step) => {
            const isClickable =
              step.id === currentStepId + 1 || step.id === currentStepId - 1;
            return (
              <StepperItem
                key={step.id}
                step={{ ...step, totalSteps: steps.length }}
                currentStep={currentStepId}
                isClickable={isClickable}
              />
            );
          })}
        </Stepper>
      </div>
    );
  },
);

export const ValidationAlert: React.FC<ValidationAlertProps> = ({
  message,
}) => (
  <div className="flex items-center gap-2 p-3 text-red-600 bg-red-50 border border-red-200 rounded-md mb-4">
    <IconAlertCircle className="h-5 w-5 flex-shrink-0" />
    <span>{message}</span>
  </div>
);
