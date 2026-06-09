import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import {
  AutomationActionFormProps,
  PlaceholderInput,
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
              <Form.Label>Recipient</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value}
                onChange={field.onChange}
                placeholderConfig={{
                  selectMode: 'one',
                  allowOnlyTriggers: true,
                }}
                enabled={{
                  call_user: true,
                  call_company: true,
                  call_customer: true,
                }}
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
              <Form.Label>Voucher campaign</Form.Label>
              <SelectVoucherCampaign.FormItem
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select voucher campaign"
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
