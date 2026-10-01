import {
  AutomationActionFormProps,
  PlaceholderInput,
  TPlaceholderInputSuggestion,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  TAdjustScoreActionConfigForm,
  adjustScoreActionConfigFormSchema,
} from '../../../states/adjustScoreActionConfigFormDefinitions';
import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAdjustScoreActionForm } from '../../../hooks/useAdjustScoreActionForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectScoreCampaign } from '~/modules/loyalties/scores/components/selects/SelectScoreCampaign';
import { EarnRowsField } from './EarnRowsField';

export const AdjustScoreCampaignActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TAdjustScoreActionConfigForm>) => {
  const { t } = useTranslation('loyalty');
  const form = useAdjustScoreActionForm({
    resolver: zodResolver(adjustScoreActionConfigFormSchema),
    currentConfig: currentAction?.config,
  });

  const { control, handleSubmit } = form;

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Adjust score configuration',
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
          name="campaignId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('score-campaign')}</Form.Label>
              <SelectScoreCampaign.FormItem
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  // Another campaign has other rows; start from all of them.
                  form.setValue('earnRowKeys', undefined);
                }}
                placeholder={t('select-score-campaign')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <EarnRowsField form={form} />
      </div>
    </Form>
  );
};
