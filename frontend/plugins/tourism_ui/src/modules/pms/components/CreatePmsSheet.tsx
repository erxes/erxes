import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet, Sidebar } from 'erxes-ui';
import { FC, PropsWithChildren, useEffect } from 'react';
import CreatePmsForm from './CreatePmsForm';
import { steps } from '../constants/steps.constants';
import { useAtom, useSetAtom } from 'jotai';
import { stepState } from '../states/stepStates';
import { sheetOpenState } from '../states/sheetStates';
import { UseFormReturn } from 'react-hook-form';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

type CreatePmsSheetContentLayoutProps = PropsWithChildren & {
  form: UseFormReturn<PmsBranchFormType>;
};

export const PmsCreateSheet = () => {
  const [open, setOpen] = useAtom(sheetOpenState);
  const setCurrentStep = useSetAtom(stepState);

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
    } else {
      setCurrentStep(1);
    }
  }, [open, setCurrentStep]);

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
        <CreatePmsForm mode="create" onOpenChange={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};

export const PmsCreateSheetHeader = ({
  mode = 'create',
}: {
  mode?: 'create' | 'edit';
}) => {
  return (
    <Sheet.Header className="p-5">
      <Sheet.Title>
        {mode === 'edit'
          ? 'Edit PMS /Property Management System/'
          : 'Create PMS /Property Management System/'}
      </Sheet.Title>
      <Sheet.Close />
    </Sheet.Header>
  );
};

export const PmsCreateSheetFooter = ({
  loading = false,
  form,
  mode = 'create',
  onSave,
}: {
  loading?: boolean;
  form: UseFormReturn<PmsBranchFormType>;
  mode?: 'create' | 'edit';
  onSave?: () => void;
}) => {
  const [currentStep, setCurrentStep] = useAtom(stepState);
  const setOpen = useSetAtom(sheetOpenState);

  const handlePreviousButton = () => {
    if (currentStep === 1) setOpen(false);
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleNextButton = async () => {
    if (currentStep >= steps.length) {
      return;
    }

    if (currentStep === 1) {
      const isValid = await form.trigger([
        'name',
        'checkInTime',
        'checkOutTime',
      ]);
      if (!isValid) {
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  return (
    <Sheet.Footer className="flex sm:justify-between lg:p-5">
      <Button variant={'outline'} onClick={handlePreviousButton} type="button">
        {currentStep === 1 ? 'Cancel' : 'Previous'}
      </Button>
      <Button
        disabled={currentStep === steps.length && loading}
        type="button"
        onClick={() =>
          currentStep === steps.length ? onSave?.() : handleNextButton()
        }
      >
        {currentStep === steps.length
          ? loading
            ? mode === 'edit'
              ? 'Saving...'
              : 'Creating...'
            : mode === 'edit'
              ? 'Save'
              : 'Create'
          : 'Next'}
      </Button>
    </Sheet.Footer>
  );
};

export const CreatePmsSheetContentLayout: FC<
  CreatePmsSheetContentLayoutProps
> = ({ children, form }) => {
  const [currentStep, setCurrentStep] = useAtom(stepState);

  const handleStepChange = async (nextStep: number) => {
    if (nextStep > currentStep) {
      if (currentStep === 1) {
        const isValid = await form.trigger([
          'name',
          'checkInTime',
          'checkOutTime',
        ]);
        if (!isValid) {
          return;
        }
      }
    }

    setCurrentStep(nextStep);
  };

  return (
    <Sheet.Content className="flex overflow-hidden p-0">
      <Sidebar collapsible="none" className="flex-none border-r">
        <Sidebar.Group>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const active = currentStep === stepNumber;

                return (
                  <Sidebar.MenuItem key={stepNumber}>
                    <Sidebar.MenuButton
                      type="button"
                      isActive={active}
                      onClick={() => void handleStepChange(stepNumber)}
                    >
                      {`${stepNumber}. ${step}`}
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                );
              })}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar>

      <div className="overflow-y-auto flex-1 p-6 bg-background">{children}</div>
    </Sheet.Content>
  );
};
