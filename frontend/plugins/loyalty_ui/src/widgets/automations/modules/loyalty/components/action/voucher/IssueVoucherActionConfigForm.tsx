import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  TPlaceholderInputSuggestion,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { SelectVoucherCampaign } from '~/modules/loyalties/vouchers/components/selects/SelectVoucherCampaign';
import { useIssueVoucherActionForm } from '../../../hooks/useCampaignActionForm';
import {
  issueVoucherActionConfigFormSchema,
  TIssueVoucherActionConfigForm,
} from '../../../states/campaignActionConfigFormDefinitions';

export const IssueVoucherActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TIssueVoucherActionConfigForm>) => {
  const { t } = useTranslation('loyalty');
  const form = useIssueVoucherActionForm({
    resolver: zodResolver(issueVoucherActionConfigFormSchema),
    currentConfig: currentAction?.config,
  });

  const { control, handleSubmit } = form;

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Issue voucher configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveActionConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <div className="flex flex-col gap-5">
        <Form.Field
          control={control}
          name="attribution"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('recipient')}</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value}
                onChange={field.onChange}
                placeholderConfig={{
                  selectMode: 'one',
                  allowOnlyTriggers: true,
                }}
                enabled={[
                  TPlaceholderInputSuggestion.CallUser,
                  TPlaceholderInputSuggestion.CallCompany,
                  TPlaceholderInputSuggestion.CallCustomer,
                ]}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="voucherCampaignId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('voucher-campaign')}</Form.Label>
              <SelectVoucherCampaign.FormItem
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('select-voucher-campaign')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
