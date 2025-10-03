import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { TmsFormType } from '@/tms/constants/formSchema';
import {
  TourName,
  SelectColor,
  LogoField,
  FavIconField,
  GeneralManeger,
  Maneger,
  Payments,
  Token,
  OtherPayments,
} from '@/tms/components/TmsFormFields';
import { Button } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';

export const TmsInformationFields = ({
  form,
  onOpenChange,
  onSubmit,
}: {
  form: UseFormReturn<TmsFormType>;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: TmsFormType) => void;
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <TourName control={form.control} />
            <SelectColor control={form.control} />
            <LogoField control={form.control} />
            <FavIconField control={form.control} />
          </>
        );
      case 2:
        return (
          <>
            <Button
              variant="default"
              className="flex items-center w-40 gap-2 mb-2"
            >
              <IconPlus size={16} />
              Add team member
            </Button>

            <GeneralManeger control={form.control} />
            <Maneger control={form.control} />
          </>
        );
      case 3:
        return (
          <>
            <Payments control={form.control} />
            <Token control={form.control} />
            <OtherPayments control={form.control} />
          </>
        );
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const result = await form.trigger(['name', 'color', 'logo']);
      if (result) setCurrentStep(2);
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

  function handleSave() {
    form.trigger(['payment', 'token']).then((isValid) => {
      if (isValid && onSubmit) {
        onSubmit(form.getValues());
      }
    });
  }

  return (
    <div className="flex flex-col justify-between w-full max-w-3xl mx-auto border-r border-[#F4F4F5]">
      <div className="flex flex-col">
        <div className="flex p-5 flex-col justify-center items-start gap-3 self-stretch border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <div className="flex h-5 px-2 justify-center items-center gap-1 rounded-[21px] border border-[rgba(79,70,229,0.10)] bg-[rgba(79,70,229,0.10)]">
              <p className="text-[#4F46E5] leading-none text-[12px] font-semibold uppercase font-mono">
                STEP {currentStep}
              </p>
            </div>
            <p className="text-[#4F46E5] font-inter text-[14px] font-semibold leading-[140%]">
              {currentStep === 1
                ? 'General information'
                : currentStep === 2
                ? 'Permission'
                : 'Payments'}
            </p>
          </div>
          <div className="flex items-center self-stretch gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-16 h-1 rounded-full ${
                  step === currentStep ? 'bg-[#4F46E5]' : 'bg-[#F4F4F5]'
                }`}
              />
            ))}
          </div>
          <p className="self-stretch text-[#71717A] font-inter text-[13px] font-medium leading-[140%]">
            {currentStep === 1
              ? 'Set up your TMS information'
              : currentStep === 2
              ? 'Setup your permission'
              : 'Setup your payments'}
          </p>
        </div>
        <div
          className={`grid grid-cols-1 gap-4 p-4 ${
            currentStep === 1 ? 'md:grid-cols-2' : ''
          } md:gap-8`}
        >
          {renderStepContent()}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 p-4 border-t border-[#F4F4F5]">
        {currentStep === 1 ? (
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        ) : (
          <Button variant="outline" onClick={handlePrevious}>
            Previous
          </Button>
        )}
        {currentStep < 3 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleSave}>Save</Button>
        )}
      </div>
    </div>
  );
};
