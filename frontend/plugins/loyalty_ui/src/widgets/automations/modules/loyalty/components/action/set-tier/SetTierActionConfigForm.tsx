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
import { useSetTierActionForm } from '../../../hooks/useSetTierActionForm';
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
  const { form, tiers } = useSetTierActionForm(currentAction?.config);
  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Set tier configuration',
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
      </div>
    </Form>
  );
};
