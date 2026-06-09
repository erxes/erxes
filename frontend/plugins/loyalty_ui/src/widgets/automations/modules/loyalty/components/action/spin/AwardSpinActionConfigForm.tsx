import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { SelectSpinCampaign } from '~/modules/loyalties/spin/components/selects/SelectSpinCampaign';
import { useAwardSpinActionForm } from '../../../hooks/useCampaignActionForm';
import {
  awardSpinActionConfigFormSchema,
  TAwardSpinActionConfigForm,
} from '../../../states/campaignActionConfigFormDefinitions';

export const AwardSpinActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TAwardSpinActionConfigForm>) => {
  const form = useAwardSpinActionForm({
    resolver: zodResolver(awardSpinActionConfigFormSchema),
    currentConfig: currentAction?.config,
  });

  const { control, handleSubmit } = form;

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Award spin configuration',
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
          name="spinCampaignId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Spin campaign</Form.Label>
              <SelectSpinCampaign.FormItem
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select spin campaign"
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
