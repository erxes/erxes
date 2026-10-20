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
import { Form, Input, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAdjustScoreActionForm } from '../../../hooks/useAdjustScoreActionForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectScoreCampaign } from '~/modules/loyalties/scores/components/selects/SelectScoreCampaign';
import { SelectLoyaltyAccountType } from '~/modules/loyalties/settings/account-type/components/SelectLoyaltyAccountType';
import { ADJUST_SCORE_MODES } from '../../../states/adjustScoreActionConfigFormDefinitions';
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
  const mode = form.watch('mode');

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

        <div className="flex flex-col gap-2">
          <Form.Label>{t('score-give-mode')}</Form.Label>
          <ToggleGroup
            type="single"
            variant="outline"
            className="w-fit"
            value={mode}
            onValueChange={(next) =>
              next &&
              form.setValue(
                'mode',
                next as (typeof ADJUST_SCORE_MODES)[number],
                {
                  shouldDirty: true,
                },
              )
            }
          >
            {ADJUST_SCORE_MODES.map((value) => (
              <ToggleGroup.Item key={value} value={value} className="px-3">
                {t(`score-give-mode-option.${value}`)}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
          <Form.Description>
            {t(`score-give-mode-hint.${mode}`)}
          </Form.Description>
        </div>

        {mode === 'fixed' ? (
          <>
            <Form.Field
              control={control}
              name="accountTypeId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('loyalty-account-type')}</Form.Label>
                  <SelectLoyaltyAccountType
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="points"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('score-fixed-points')}</Form.Label>
                  <Form.Control>
                    <Input
                      type="number"
                      min={1}
                      placeholder="0"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </>
        ) : (
          <>
            <Form.Field
              control={control}
              name="campaignId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('score-campaign')}</Form.Label>
                  <SelectScoreCampaign.FormItem
                    value={field.value ?? ''}
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
          </>
        )}
      </div>
    </Form>
  );
};
