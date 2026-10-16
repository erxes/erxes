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

type TLegacyCustomRule = { duration?: string; count?: number; unit?: string };

// Older steps saved one `duration` step; read it as one of that unit.
const readCustomRule = (
  rule?: TLegacyCustomRule,
): TIssueVoucherActionConfigForm['customRule'] => {
  if (rule?.count && rule.unit) {
    return rule as TIssueVoucherActionConfigForm['customRule'];
  }

  const unit = rule?.duration === 'minute' ? 'day' : rule?.duration;

  return unit === 'day' || unit === 'week' || unit === 'month'
    ? { count: 1, unit }
    : undefined;
};

export const useIssueVoucherActionForm = ({
  currentConfig,
  ...options
}: UseIssueVoucherActionFormProps) => {
  const form = useForm<TIssueVoucherActionConfigForm>({
    ...options,
    defaultValues: {
      attribution: '',
      voucherCampaignId: '',
      ...currentConfig,
      customRule: readCustomRule(currentConfig?.customRule),
      ...options.defaultValues,
    },
  });

  const customRule = form.watch('customRule');

  // Choosing the campaign's term drops the step's own.
  const setCustomValidity = (custom: boolean) =>
    form.setValue(
      'customRule',
      custom ? { count: 1, unit: 'month' } : undefined,
      { shouldDirty: true },
    );

  return { form, customValidity: !!customRule, setCustomValidity };
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
