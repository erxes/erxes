import { UseFormReturn } from 'react-hook-form';
import { PmsBranchFormType } from '../constants/formSchema';
import { useAtomValue } from 'jotai';
import { stepState } from '../states/stepStates';
import General from './pmsFormFields/general/General';
import Payments from './pmsFormFields/payments/payments';
import Admins from './pmsFormFields/admins/admins';
import Appearance from './pmsFormFields/appearance/appearance';
import PipelineConfig from './pmsFormFields/pipelineConfig/pipelineConfig';

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
