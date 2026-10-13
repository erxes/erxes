import { Form, Input, Select } from 'erxes-ui';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TLoyaltyAccountTypeFormValues } from '../hooks/useLoyaltyAccountTypeForm';
import { LoyaltyAccountTypePeriodPreview } from './LoyaltyAccountTypePeriodPreview';
import {
  LOYALTY_EXPIRY_MODES,
  LOYALTY_RESET_PERIODS,
  LOYALTY_TIER_RESET_TO,
} from '../types';

// `control` is passed in: the plugin's react-hook-form copy cannot read the
// context erxes-ui's Form provides.
export const LoyaltyAccountTypeExpirySection = ({
  control,
  accountTypeId,
}: {
  control: Control<TLoyaltyAccountTypeFormValues>;
  accountTypeId?: string;
}) => {
  const { t } = useTranslation('loyalty');
  const expiryMode = useWatch({ control, name: 'expiry.mode' });
  const period = useWatch({ control, name: 'reset.period' });
  const tierCount = useWatch({ control, name: 'tiers' })?.length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Form.Field
          control={control}
          name="expiry.mode"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('loyalty-expiry')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {LOYALTY_EXPIRY_MODES.map((value) => (
                    <Select.Item key={value} value={value}>
                      {t(`loyalty-expiry-${value}`)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        {expiryMode === 'rolling' && (
          <Form.Field
            control={control}
            name="expiry.months"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('loyalty-expiry-months')}</Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    value={field.value ?? ''}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
      </div>
      <Form.Field
        control={control}
        name="reset.period"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('loyalty-reset-period')}</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {LOYALTY_RESET_PERIODS.map((value) => (
                  <Select.Item key={value} value={value}>
                    {t(`loyalty-reset-period-${value}`)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Description>
              {t('loyalty-reset-period-hint')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
      {period !== 'never' && tierCount > 0 && (
        <Form.Field
          control={control}
          name="reset.tierTo"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('loyalty-reset-tier-to')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {LOYALTY_TIER_RESET_TO.map((value) => (
                    <Select.Item key={value} value={value}>
                      {t(`loyalty-reset-tier-to-${value}`)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
      <LoyaltyAccountTypePeriodPreview
        control={control}
        accountTypeId={accountTypeId}
      />
    </div>
  );
};
