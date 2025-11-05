import { UseFormReturn } from 'react-hook-form';
import { useAtom, useSetAtom } from 'jotai';
import { useQuery } from '@apollo/client';
import { currentStepAtom } from '@/tms/states/tmsInformationFieldsAtoms';
import { tmsFormAtom } from '@/tms/atoms/formAtoms';
import { TmsFormType } from '@/tms/constants/formSchema';
import { PAYMENT_LIST } from '@/tms/graphql/queries';
import {
  TourName,
  SelectColor,
  LogoField,
  FavIconField,
  GeneralManager,
  Manager,
  Payments,
  Token,
  OtherPayments,
  PaymentType,
} from '@/tms/components/TmsFormFields';
import { Button } from 'erxes-ui';
import { useEffect, useState } from 'react';

export const TmsInformationFields = ({
  form,
  onOpenChange,
  onSubmit,
  isOpen,
  isLoading,
}: {
  form: UseFormReturn<TmsFormType>;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: TmsFormType) => void;
  isOpen?: boolean;
  isLoading?: boolean;
}) => {
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const setFormAtom = useSetAtom(tmsFormAtom);

  const { data: paymentsData, loading: paymentsLoading } =
    useQuery(PAYMENT_LIST);
  const payments: PaymentType[] = paymentsData?.payments ?? [];

  useEffect(() => {
    if (isOpen && !hasBeenOpened) {
      setCurrentStep(1);
      setHasBeenOpened(true);
    } else if (!isOpen) {
      setHasBeenOpened(false);
    }
  }, [isOpen, hasBeenOpened, setCurrentStep]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormAtom({
        name: value.name || '',
        color: value.color || '#4F46E5',
        logo: value.logo || '',
        favIcon: value.favIcon || '',
        generalManager: Array.isArray(value.generalManager)
          ? value.generalManager.filter((id): id is string => !!id)
          : [],
        managers: Array.isArray(value.managers)
          ? value.managers.filter((id): id is string => !!id)
          : [],
        payment: value.payment || '',
        token: value.token || '',
        otherPayments: Array.isArray(value.otherPayments)
          ? value.otherPayments.filter(
              (
                payment,
              ): payment is {
                type: string;
                title: string;
                icon: string;
                config?: string;
              } =>
                !!payment &&
                !!payment.type &&
                !!payment.title &&
                !!payment.icon,
            )
          : [],
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setFormAtom]);

  const renderStepContent = () => {
    return (
      <div className="relative w-full min-h-[300px]">
        {/* Step 1 */}
        <div
          className={`absolute inset-0 w-full transition-all duration-300 ease-in-out ${
            currentStep === 1 ? 'opacity-100 block' : 'opacity-0 hidden'
          }`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
            <TourName control={form.control} />
            <SelectColor control={form.control} />
            <LogoField control={form.control} />
            <FavIconField control={form.control} />
          </div>
        </div>

        {/* Step 2 */}
        <div
          className={`absolute inset-0 w-full transition-all duration-300 ease-in-out ${
            currentStep === 2 ? 'opacity-100 block' : 'opacity-0 hidden'
          }`}
        >
          <div className="space-y-4">
            <GeneralManager control={form.control} />
            <Manager control={form.control} />
          </div>
        </div>

        {/* Step 3 */}
        <div
          className={`absolute inset-0 w-full transition-all duration-300 ease-in-out ${
            currentStep === 3 ? 'opacity-100 block' : 'opacity-0 hidden'
          }`}
        >
          <div className="space-y-4">
            <Payments
              control={form.control}
              payments={payments}
              loading={paymentsLoading}
            />
            <Token control={form.control} />
            <OtherPayments control={form.control} />
          </div>
        </div>
      </div>
    );
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const result = await form.trigger(['name', 'color']);
      if (result) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  function handleCancel() {
    if (onOpenChange) onOpenChange(false);
  }

  async function handleSave() {
    const isValid = await form.trigger(['name', 'color']);

    if (!isValid || !onSubmit) {
      return;
    }

    onSubmit(form.getValues());
  }

  return (
    <div className="flex flex-col mx-auto w-full max-w-3xl h-full border-r">
      <div className="flex flex-col flex-shrink-0 gap-3 justify-center items-start self-stretch p-5 border-b">
        <div className="flex gap-2 items-center">
          <div className="flex h-5 px-2 justify-center items-center gap-1 rounded-[21px] bg-[rgba(79,70,229,0.10)] transition-all duration-300">
            <p className="text-primary leading-none text-[12px] font-semibold uppercase font-mono">
              STEP {currentStep}
            </p>
          </div>
          <p className="text-primary font-inter text-[14px] font-semibold leading-[140%] transition-all duration-300">
            {currentStep === 1
              ? 'General information'
              : currentStep === 2
              ? 'Permission'
              : 'Payments'}
          </p>
        </div>
        <div className="flex gap-2 items-center self-stretch">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1 rounded-full transition-all duration-500 ease-in-out ${
                step === currentStep
                  ? 'bg-primary w-24'
                  : step < currentStep
                  ? 'bg-primary/50 w-16'
                  : 'bg-[#F4F4F5] w-16'
              }`}
            />
          ))}
        </div>
        <p className="self-stretch text-muted-foreground font-inter text-[13px] font-medium leading-[140%] transition-all duration-300">
          {currentStep === 1
            ? 'Set up your TMS information'
            : currentStep === 2
            ? 'Setup your permission'
            : 'Setup your payments'}
        </p>
      </div>
      <div className="relative flex-1">
        <div className="overflow-y-auto overflow-x-hidden px-4 py-2 h-full max-h-screen">
          {renderStepContent()}
        </div>
      </div>

      <div className="flex flex-shrink-0 gap-2 justify-between items-center p-4 border-t">
        {currentStep === 1 ? (
          <Button
            variant="outline"
            onClick={handleCancel}
            className="transition-all duration-200 hover:scale-105"
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="transition-all duration-200 hover:scale-105"
          >
            Previous
          </Button>
        )}
        {currentStep < 3 ? (
          <Button
            onClick={handleNext}
            className="transition-all duration-200 hover:scale-105"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="transition-all duration-200 hover:scale-105"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>
    </div>
  );
};
