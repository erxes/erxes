import { Form, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  TPlaceholderInputSuggestion,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { SelectLoyaltyAccountType } from '~/modules/loyalties/settings/account-type/components/SelectLoyaltyAccountType';
import { TierBandsFields } from '~/modules/loyalties/settings/account-type/components/TierBandsFields';
import {
  toSetTierConfig,
  useSetTierActionForm,
} from '../../../hooks/useSetTierActionForm';
import { TSetTierActionConfigForm } from '../../../states/setTierActionConfigFormDefinitions';

// Select items cannot hold an empty value; an empty tier clears it.
const NO_TIER = '__none';

export const SetTierActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TSetTierActionConfigForm>) => {
  const { t } = useTranslation('loyalty');
  const { form, mode, tiers, bandsValue, setBandsValue } = useSetTierActionForm(
    currentAction?.config,
  );
  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Set tier configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(
        (values) => onSaveActionConfig(toSetTierConfig(values)),
        handleValidationErrors,
      )();
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
          name="accountTypeId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('loyalty-account-type')}</Form.Label>
              <SelectLoyaltyAccountType
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue('tier', '');
                }}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="mode"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('set-tier-mode')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  <Select.Item value="fixed">
                    {t('set-tier-mode-fixed')}
                  </Select.Item>
                  <Select.Item value="amount">
                    {t('set-tier-mode-amount')}
                  </Select.Item>
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />
        {mode === 'amount' && (
          <Form.Field
            control={control}
            name="bands"
            render={() => (
              <Form.Item>
                <Form.Label>{t('set-tier-bands')}</Form.Label>
                <TierBandsFields
                  tiers={tiers}
                  value={bandsValue}
                  onChange={setBandsValue}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
        {mode === 'fixed' && (
          <Form.Field
            control={control}
            name="tier"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('loyalty-tier')}</Form.Label>
                <Select
                  value={field.value || NO_TIER}
                  onValueChange={(value) =>
                    field.onChange(value === NO_TIER ? '' : value)
                  }
                >
                  <Form.Control>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    <Select.Item value={NO_TIER}>
                      {t('loyalty-tier-none')}
                    </Select.Item>
                    {tiers.map(({ key, name }) => (
                      <Select.Item key={key} value={key}>
                        {name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Form.Description>{t('set-tier-hint')}</Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
      </div>
    </Form>
  );
};
