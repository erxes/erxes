import React, { useMemo, useState } from 'react';
import { Stepper, Resizable, Button, useMultiQueryState } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { PosDetailSheet } from './posDetailSheet';
import { posCategoryAtom } from '@/pos/create-pos/states/posCategory';
import {
  BasicInfoFormValues,
  PermissionFormValues,
} from '@/pos/create-pos/components/formSchema';
import { LAYOUT, navigateToTab } from '@/pos/constants';
import {
  NavigationFooterProps,
  PosTabContentProps,
  StepConfig,
  StepperItemProps,
  VerticalStepperProps,
} from '../types/IPosLayout';
import { ValidationAlert } from '@/pos/create-pos/components/index/lay-stepper';
import { UseFormReturn } from 'react-hook-form';
import { IPosDetail } from '../types/IPos';

const getSteps = (posCategory: string | null): StepConfig[] => {
  const baseSteps: StepConfig[] = [
    { value: 'properties', title: 'General information' },
    { value: 'payments', title: 'Payments' },
    { value: 'permission', title: 'Permission' },
    { value: 'product', title: 'Product & Service' },
    { value: 'appearance', title: 'Appearance' },
    { value: 'screen', title: 'Screen config' },
    { value: 'ebarimt', title: 'Ebarimt config' },
    { value: 'finance', title: 'Finance config' },
    { value: 'delivery', title: 'Delivery config' },
    { value: 'sync', title: 'Sync card' },
  ];

  if (posCategory === 'restaurant') {
    const updatedSteps = [...baseSteps];
    updatedSteps.splice(1, 0, { value: 'slot', title: 'Slot' });
    return updatedSteps;
  }

  return baseSteps;
};

const StepperItem = React.memo(
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

const VerticalStepper = React.memo(
  ({
    steps,
    currentStepId,
    hasCategorySelected,
    searchParams,
    setSearchParams,
  }: VerticalStepperProps) => {
    const handleStepChange = (stepId: number): void => {
      const targetStep = steps.find((step) => step.id === stepId);
      if (targetStep && hasCategorySelected) {
        navigateToTab(setSearchParams, searchParams, targetStep.value);
      }
    };

    return (
      <div
        className={`${LAYOUT.STEPPER_WIDTH} border-r bg-gray-50 p-5 overflow-y-auto`}
      >
        <div className="mb-4 flex items-center gap-2 text-sm text-blue-600 font-medium">
          <IconEdit className="h-4 w-4" />
          Edit Mode
        </div>
        <Stepper
          value={currentStepId}
          onValueChange={handleStepChange}
          orientation="vertical"
          className="w-full"
        >
          {steps.map((step) => {
            const isClickable = hasCategorySelected;
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

const NavigationFooter = React.memo(
  ({
    prevStep,
    nextStep,
    handlePrevStep,
    handleNextStep,
    isLastStep,
    validationError = null,
  }: NavigationFooterProps) => (
    <div className="flex flex-col p-4 border-t sticky bottom-0 bg-white">
      {validationError && <ValidationAlert message={validationError} />}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevStep}
          disabled={!prevStep}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleNextStep}
            disabled={!nextStep && !isLastStep}
          >
            {isLastStep ? 'Save & Close' : 'Next step'}
          </Button>
          {isLastStep && (
            <Button type="button" onClick={handleNextStep}>
              Update POS
            </Button>
          )}
        </div>
      </div>
    </div>
  ),
);

export const PosEditTabContent: React.FC<PosTabContentProps> = ({
  children,
  value,
}) => {
  const [searchParams] = useSearchParams();
  const [posCategory] = useAtom(posCategoryAtom);
  const selectedStep = searchParams.get('tab') || 'properties';
  const hasCategorySelected = !!posCategory;

  if (value !== selectedStep) {
    return null;
  }

  if (!hasCategorySelected) {
    return (
      <div className="flex-auto overflow-hidden flex items-center justify-center h-full">
        <div className="text-center p-8 rounded-lg bg-yellow-50 border border-yellow-200">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Category Selection Required
          </h3>
          <p className="text-yellow-700">
            Please select a category first before accessing this section.
          </p>
        </div>
      </div>
    );
  }

  return <div className="flex-auto overflow-auto">{children}</div>;
};

interface PosEditStepperProps {
  children: React.ReactNode;
}

const PosEditStepper: React.FC<PosEditStepperProps> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posCategory] = useAtom(posCategoryAtom);
  const selectedStep = searchParams.get('tab') || 'properties';
  const hasCategorySelected = !!posCategory;

  const stepsWithIds = useMemo(() => {
    return getSteps(posCategory).map((step, idx) => ({
      ...step,
      id: idx + 1,
    }));
  }, [posCategory]);

  const currentStepId = useMemo(() => {
    return stepsWithIds.find((step) => step.value === selectedStep)?.id || 1;
  }, [stepsWithIds, selectedStep]);

  React.useEffect(() => {
    if (
      selectedStep &&
      !stepsWithIds.some((step) => step.value === selectedStep)
    ) {
      navigateToTab(setSearchParams, searchParams, 'properties');
    }
  }, [selectedStep, stepsWithIds, setSearchParams, searchParams]);

  return (
    <div className="flex h-full">
      <VerticalStepper
        steps={stepsWithIds}
        currentStepId={currentStepId}
        hasCategorySelected={hasCategorySelected}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
      <div className={`flex-1 overflow-auto p-6 ${LAYOUT.CONTENT_MAX_HEIGHT}`}>
        {children}
      </div>
    </div>
  );
};

interface PosEditLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  form?:
    | UseFormReturn<BasicInfoFormValues>
    | UseFormReturn<PermissionFormValues>;
  onFinalSubmit?: () => void;
  posDetail?: IPosDetail;
}

export const PosEditLayout: React.FC<PosEditLayoutProps> = ({
  children,
  actions,
  form,
  onFinalSubmit,
}) => {
  const [posCategory] = useAtom(posCategoryAtom);
  const [{ tab: selectedStep }, setQueries] = useMultiQueryState<{
    tab: string;
  }>(['tab']);
  const [validationError, setValidationError] = useState<string | null>(null);

  const steps = useMemo(() => {
    return getSteps(posCategory).map((step, idx) => ({ ...step, id: idx + 1 }));
  }, [posCategory]);

  const currentStepIndex = steps.findIndex(
    (step) => step.value === selectedStep,
  );
  const prevStep =
    currentStepIndex > 0 ? steps[currentStepIndex - 1].value : null;
  const nextStep =
    currentStepIndex < steps.length - 1
      ? steps[currentStepIndex + 1].value
      : null;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handlePrevStep = (): void => {
    setValidationError(null);
    if (prevStep) {
      setQueries({ tab: prevStep });
    }
  };

  const validateCurrentStep = (): boolean => {
    if (selectedStep === 'properties' && form) {
      if ('name' in form.getValues()) {
        const values = form.getValues() as BasicInfoFormValues;

        if (!values.name?.trim()) {
          setValidationError('Please enter a name before proceeding.');
          return false;
        }

        if (!values.description?.trim()) {
          setValidationError('Please enter a description before proceeding.');
          return false;
        }

        if (!values.allowTypes || values.allowTypes.length === 0) {
          setValidationError(
            'Please select at least one type before proceeding.',
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleNextStep = async (): Promise<void> => {
    setValidationError(null);

    if (!validateCurrentStep()) {
      return;
    }

    if (selectedStep === 'properties' && form) {
      try {
        const isValid = await form.trigger();

        if (!isValid) {
          setValidationError('Please fix the form errors before proceeding.');
          return;
        }
      } catch (error) {
        setValidationError('Failed to validate form. Please try again.');
        return;
      }
    }

    if (isLastStep) {
      try {
        if (onFinalSubmit) {
          await onFinalSubmit();
        }
      } catch (error) {
        setValidationError('Failed to update. Please try again.');
      }
      return;
    }

    if (nextStep) {
      setQueries({ tab: nextStep });
    }
  };

  return (
    <PosDetailSheet>
      <div className="flex h-auto flex-auto overflow-auto bg-white">
        <div className="flex flex-col flex-auto min-h-full overflow-hidden">
          <Resizable.PanelGroup
            direction="horizontal"
            className="flex-auto min-h-full overflow-hidden"
          >
            <Resizable.Panel defaultSize={75} minSize={30}>
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto min-h-0">
                  <PosEditStepper>{children}</PosEditStepper>
                </div>

                <NavigationFooter
                  prevStep={prevStep}
                  nextStep={nextStep}
                  handlePrevStep={handlePrevStep}
                  handleNextStep={handleNextStep}
                  isLastStep={isLastStep}
                  validationError={validationError}
                />
              </div>
            </Resizable.Panel>

            {actions && (
              <>
                <Resizable.Handle />
                <Resizable.Panel defaultSize={25} minSize={20}>
                  {actions}
                </Resizable.Panel>
              </>
            )}
          </Resizable.PanelGroup>
        </div>
      </div>
    </PosDetailSheet>
  );
};
