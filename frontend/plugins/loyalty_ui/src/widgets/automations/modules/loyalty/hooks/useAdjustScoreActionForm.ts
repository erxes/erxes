import { TAdjustScoreActionConfigForm } from '../states/adjustScoreActionConfigFormDefinitions';
import { UseFormProps, useForm } from 'react-hook-form';

type UseAdjustScoreActionFormProps =
  UseFormProps<TAdjustScoreActionConfigForm> & {
    currentConfig?: Partial<TAdjustScoreActionConfigForm>;
  };

export const useAdjustScoreActionForm = ({
  currentConfig,
  ...options
}: UseAdjustScoreActionFormProps) => {
  return useForm<TAdjustScoreActionConfigForm>({
    ...options,
    defaultValues: {
      action: 'add',
      attribution: '',
      campaignId: '',
      ...currentConfig,
      ...options.defaultValues,
    },
  });
};
