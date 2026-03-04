import { UseFormReturn } from 'react-hook-form';
import { PmsBranchFormType } from '@/pms/constants/formSchema';
import { useAtomValue } from 'jotai';
import { stepState } from '@/pms/states/stepStates';
import General from '@/pms/components/pmsFormFields/general/General';
import Payments from '@/pms/components/pmsFormFields/payments/payments';
import Admins from '@/pms/components/pmsFormFields/admins/admins';
import Appearance from '@/pms/components/pmsFormFields/appearance/appearance';
import PipelineConfig from '@/pms/components/pmsFormFields/pipelineConfig/pipelineConfig';

export const CreatePmsFormContent = ({
  form,
}: {
  form: UseFormReturn<PmsBranchFormType>;
}) => {
  const currentStep = useAtomValue(stepState);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <General control={form.control} />;
      case 2:
        return <Payments control={form.control} />;
      case 3:
        return <Admins control={form.control} />;
      case 4:
        return <Appearance control={form.control} />;
      case 5:
        return <PipelineConfig form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">{renderStepContent()}</div>
  );
};
