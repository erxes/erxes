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
  const { t } = useTranslation('loyalty');
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
          name="spinCampaignId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('spin-campaign')}</Form.Label>
              <SelectSpinCampaign.FormItem
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('select-spin-campaign')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
