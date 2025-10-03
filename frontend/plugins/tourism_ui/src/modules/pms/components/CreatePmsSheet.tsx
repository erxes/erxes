import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet, Stepper } from 'erxes-ui';
import { PropsWithChildren, useState } from 'react';
import CreatePmsForm from './CreatePmsForm';
import { steps } from '../constants/steps.constants';
import { useAtom, useSetAtom } from 'jotai';
import { stepState } from '../states/stepStates';
import { sheetOpenState } from '../states/sheetStates';

export const PmsCreateSheet = () => {
  const [open, setOpen] = useAtom(sheetOpenState);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Create PMS
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0 sm:max-w-8xl"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <CreatePmsForm onOpenChange={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};

export const PmsCreateSheetHeader = () => {
  return (
    <Sheet.Header className="p-5">
      <Sheet.Title>Create PMS /Property Management System/</Sheet.Title>
      <Sheet.Close />
    </Sheet.Header>
  );
};

export const PmsCreateSheetFooter = () => {
  const [currentStep, setCurrentStep] = useAtom(stepState);
  const setOpen = useSetAtom(sheetOpenState);

  const handlePreviousButton = () => {
    if (currentStep === 1) setOpen(false);
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleNextButton = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  return (
    <Sheet.Footer className="flex sm:justify-between lg:p-5">
      <Button variant={'outline'} onClick={handlePreviousButton} type="button">
        {currentStep === 1 ? 'Cancel' : 'Previous'}
      </Button>
      <Button
        onClick={handleNextButton}
        type={currentStep === steps.length ? 'submit' : 'button'}
      >
        {currentStep === steps.length ? 'Save' : 'Next'}
      </Button>
    </Sheet.Footer>
  );
};

export const CreatePmsSheetContentLayout = ({
  children,
}: PropsWithChildren) => {
  const [currentStep, setCurrentStep] = useAtom(stepState);

  return (
    <Sheet.Content className="p-5 flex gap-6 overflow-y-auto relative">
      <div className="w-[200px] h-fit sticky top-0">
        <Stepper
          value={currentStep}
          onValueChange={setCurrentStep}
          orientation="vertical"
        >
          {steps.map((step, index) => (
            <Stepper.Item
              key={index + 1}
              step={index + 1}
              className="relative items-start not-last:flex-1"
            >
              <Stepper.Trigger
                className="items-center rounded gap-2 pb-5 last:pb-0"
                type="button"
              >
                <Stepper.Indicator className="size-8" asChild>
                  {index + 1}
                </Stepper.Indicator>
                <div className="text-left">
                  <Stepper.Title>{step}</Stepper.Title>
                </div>
              </Stepper.Trigger>
              {index + 1 < steps.length && (
                <Stepper.Separator className="absolute inset-y-0 top-[calc(2rem+0.125rem)] left-4 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-2rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-2rem-0.25rem)]" />
              )}
            </Stepper.Item>
          ))}
        </Stepper>
      </div>

      {children}
    </Sheet.Content>
  );
};
