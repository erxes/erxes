import { Form, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  AutomationTriggerFormProps,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { SelectLoyaltyAccountType } from '~/modules/loyalties/settings/account-type/components/SelectLoyaltyAccountType';
import { useTierChangedTriggerForm } from '../../hooks/useTierChangedTriggerForm';
import {
  TIER_DIRECTIONS,
  TTierChangedTriggerConfigForm,
} from '../../states/tierChangedTriggerConfigFormDefinitions';

// Select items cannot hold an empty value; an empty tier means any tier.
const ANY_TIER = '__any';

export const TierChangedTriggerConfigForm = ({
  formRef,
  onSaveTriggerConfig,
  activeTrigger,
}: AutomationTriggerFormProps<TTierChangedTriggerConfigForm>) => {
  const { t } = useTranslation('loyalty');
  const { form, tiers, changeAccountType } = useTierChangedTriggerForm(
    activeTrigger?.config,
  );
  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Tier changed trigger configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveTriggerConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <div className="flex flex-col gap-5">
        <Form.Field
          control={control}
          name="accountTypeId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('loyalty-account-type')}</Form.Label>
              <SelectLoyaltyAccountType
                value={field.value}
                onValueChange={changeAccountType}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="direction"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('tier-changed-direction')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {TIER_DIRECTIONS.map((direction) => (
                    <Select.Item key={direction} value={direction}>
                      {t(`tier-changed-direction-${direction}`)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="toTier"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('tier-changed-to')}</Form.Label>
              <Select
                value={field.value || ANY_TIER}
                onValueChange={(value) =>
                  field.onChange(value === ANY_TIER ? '' : value)
                }
              >
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  <Select.Item value={ANY_TIER}>
                    {t('tier-changed-any-tier')}
                  </Select.Item>
                  {tiers.map(({ key, name }) => (
                    <Select.Item key={key} value={key}>
                      {name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Description>{t('tier-changed-hint')}</Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
