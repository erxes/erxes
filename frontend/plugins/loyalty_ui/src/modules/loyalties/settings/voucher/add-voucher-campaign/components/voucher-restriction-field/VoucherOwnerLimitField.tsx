import { Form, Input, Select } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { VoucherFormValues } from '../../../constants/voucherFormSchema';
import { VOUCHER_OWNER_LIMIT_PERIODS } from '../../../utils/voucherOwnerLimit';

/** How many one owner may receive from this campaign, and over what span. */
export const VoucherOwnerLimitField = ({
  form,
}: {
  form: UseFormReturn<VoucherFormValues>;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <div className="flex flex-col gap-2">
      <Form.Label>{t('owner-limit')}</Form.Label>
      <div className="grid grid-cols-2 gap-4">
        <Form.Field
          control={form.control}
          name="ownerLimitCount"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  type="number"
                  min={1}
                  placeholder={t('owner-limit-none')}
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
        <Form.Field
          control={form.control}
          name="ownerLimitPeriod"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Select onValueChange={field.onChange} value={field.value}>
                  <Select.Trigger>
                    {t(`owner-limit-period.${field.value}`)}
                  </Select.Trigger>
                  <Select.Content>
                    {VOUCHER_OWNER_LIMIT_PERIODS.map((period) => (
                      <Select.Item key={period} value={period}>
                        {t(`owner-limit-period.${period}`)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <Form.Description>{t('owner-limit-hint')}</Form.Description>
    </div>
  );
};
