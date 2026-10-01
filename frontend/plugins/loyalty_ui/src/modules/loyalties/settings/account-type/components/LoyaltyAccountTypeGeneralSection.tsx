import { Form, Input, Select } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TLoyaltyAccountTypeFormValues } from '../hooks/useLoyaltyAccountTypeForm';
import { LOYALTY_ACCOUNT_TYPE_OWNER_TYPES } from '../types';

// `control` is passed in: the plugin's react-hook-form copy cannot read the
// context erxes-ui's Form provides.
export const LoyaltyAccountTypeGeneralSection = ({
  control,
  isEdit,
}: {
  control: Control<TLoyaltyAccountTypeFormValues>;
  isEdit: boolean;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t('loyalty-account-type-description')}
      </p>
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('name')}</Form.Label>
            <Form.Control>
              <Input
                {...field}
                placeholder={t('loyalty-account-type-name-placeholder')}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="ownerType"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('apply-score-to')}</Form.Label>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isEdit}
            >
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {LOYALTY_ACCOUNT_TYPE_OWNER_TYPES.map(({ value, label }) => (
                  <Select.Item key={value} value={value}>
                    {t(label)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Description>
              {t('loyalty-account-type-owner-type-hint')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="frozenBlocks"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('loyalty-frozen-blocks')}</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                <Select.Item value="spending">
                  {t('loyalty-frozen-blocks-spending')}
                </Select.Item>
                <Select.Item value="all">
                  {t('loyalty-frozen-blocks-all')}
                </Select.Item>
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
