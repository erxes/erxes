import { UseFormProps, useForm } from 'react-hook-form';
import {
  TAwardSpinActionConfigForm,
  TIssueVoucherActionConfigForm,
} from '../states/campaignActionConfigFormDefinitions';

type UseIssueVoucherActionFormProps =
  UseFormProps<TIssueVoucherActionConfigForm> & {
    currentConfig?: Partial<TIssueVoucherActionConfigForm>;
  };

type UseAwardSpinActionFormProps = UseFormProps<TAwardSpinActionConfigForm> & {
  currentConfig?: Partial<TAwardSpinActionConfigForm>;
};

export const useIssueVoucherActionForm = ({
  currentConfig,
  ...options
}: UseIssueVoucherActionFormProps) => {
  return useForm<TIssueVoucherActionConfigForm>({
    ...options,
    defaultValues: {
      attribution: '',
      voucherCampaignId: '',
      ...currentConfig,
      ...options.defaultValues,
    },
  });
};

export const useAwardSpinActionForm = ({
  currentConfig,
  ...options
}: UseAwardSpinActionFormProps) => {
  return useForm<TAwardSpinActionConfigForm>({
    ...options,
    defaultValues: {
      attribution: '',
      spinCampaignId: '',
      ...currentConfig,
      ...options.defaultValues,
    },
  });
};
