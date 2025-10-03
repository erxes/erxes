import React, { useMemo, useState } from 'react';
import { Resizable, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { posCategoryAtom } from '../../states/posCategory';
import { PosDetailSheet } from './posDetailSheet';
import { getSteps, LAYOUT } from '@/pos/constants';
import { VerticalStepper } from './lay-stepper';
import { NavigationFooter } from './navigation-footer';
import {
  PosLayoutProps,
  PosCreateStepperProps,
  PosTabContentProps,
} from '@/pos/pos-detail/types/IPosLayout';

export const PosCreateTabContent: React.FC<PosTabContentProps> = ({
  children,
  value,
}) => {
  const [tab] = useQueryState<string>('tab', { defaultValue: 'overview' });
  const [posCategory] = useAtom(posCategoryAtom);
  const hasCategorySelected = !!posCategory;

  if (value !== tab) {
    return null;
  }

  if (value !== 'overview' && !hasCategorySelected) {
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

export const PosCreateStepper: React.FC<PosCreateStepperProps> = ({
  children,
}) => {
  const [tab, setTab] = useQueryState<string>('tab', {
    defaultValue: 'overview',
  });
  const [posCategory] = useAtom(posCategoryAtom);
  const hasCategorySelected = !!posCategory;

  const stepsWithIds = useMemo(() => {
    return getSteps(posCategory).map((step, idx) => ({
      ...step,
      id: idx + 1,
    }));
  }, [posCategory]);

  const currentStepId = useMemo(() => {
    return stepsWithIds.find((step) => step.value === tab)?.id || 1;
  }, [stepsWithIds, tab]);

  React.useEffect(() => {
    if (tab && !stepsWithIds.some((step) => step.value === tab)) {
      setTab('overview');
    }
  }, [tab, stepsWithIds, setTab]);

  return (
    <div className="flex h-full">
      <VerticalStepper
        steps={stepsWithIds}
        currentStepId={currentStepId}
        hasCategorySelected={hasCategorySelected}
        searchParams={new URLSearchParams(window.location.search)}
        setSearchParams={(params) => {
          const newParams = new URLSearchParams(params);
          setTab(newParams.get('tab') || 'overview');
        }}
      />
      <div className={`flex-1 overflow-auto p-6 ${LAYOUT.CONTENT_MAX_HEIGHT}`}>
        {children}
      </div>
    </div>
  );
};

export const PosCreateLayout: React.FC<PosLayoutProps> = ({
  children,
  actions,
  form,
  onFormSubmit,
  onFinalSubmit,
  isSubmitting = false,
  onSaveSlots,
}) => {
  const [tab, setTab] = useQueryState<string>('tab', {
    defaultValue: 'overview',
  });
  const [posCategory] = useAtom(posCategoryAtom);
  const [isLoading, setIsLoading] = React.useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const steps = useMemo(() => {
    return getSteps(posCategory).map((step, idx) => ({ ...step, id: idx + 1 }));
  }, [posCategory]);

  const currentStepIndex = steps.findIndex((step) => step.value === tab);
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
      setTab(prevStep);
    }
  };

  const validateCurrentStep = (): boolean => {
    if (tab === 'properties' && form) {
      const values = form.getValues();

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
    return true;
  };

  const handleNextStep = async (): Promise<void> => {
    setValidationError(null);

    if (!validateCurrentStep()) {
      return;
    }

    if (tab === 'properties' && form && onFormSubmit) {
      try {
        setIsLoading(true);
        const isValid = await form.trigger();

        if (!isValid) {
          setValidationError('Please fix the form errors before proceeding.');
          return;
        }

        const formData = form.getValues();
        onFormSubmit(formData);
      } catch (error) {
        setValidationError('Failed to save form data. Please try again.');
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (isLastStep) {
      try {
        setIsLoading(true);

        if (tab === 'slot' && onSaveSlots) {
          try {
            await onSaveSlots();
          } catch (error) {
            setValidationError('Failed to save slots. Please try again.');
            return;
          }
        }

        if (onFinalSubmit) {
          await onFinalSubmit();
        }
      } catch (error) {
        setValidationError('Failed to save. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (nextStep) {
      setTab(nextStep);
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
                  <PosCreateStepper>{children}</PosCreateStepper>
                </div>

                <NavigationFooter
                  prevStep={prevStep}
                  nextStep={nextStep}
                  handlePrevStep={handlePrevStep}
                  handleNextStep={handleNextStep}
                  isLastStep={isLastStep}
                  isLoading={isLoading}
                  validationError={validationError}
                  isSubmitting={isSubmitting}
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
