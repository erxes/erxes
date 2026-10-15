import { Form, Input, Select, ToggleGroup } from 'erxes-ui';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { VoucherFormValues } from '../../../constants/voucherFormSchema';
import { VOUCHER_KIND_TYPES } from '../../constants/voucherKindTypeData';
import { VOUCHER_TYPES } from '../../constants/voucherTypeData';

// Only these take money off a sale; the others hand out something else.
const DISCOUNTING_TYPES = ['discount', 'reward'];

interface VoucherAddCampaignCoreFieldsProps {
  form: UseFormReturn<VoucherFormValues>;
}

/** What one voucher of this campaign gives. */
export const VoucherAddCampaignCoreFields: React.FC<
  VoucherAddCampaignCoreFieldsProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  const [type, kind, value] = form.watch(['type', 'kind', 'value']);
  const discounting = DISCOUNTING_TYPES.includes(type);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold">{t('voucher-gives')}</h3>
        <p className="text-xs text-muted-foreground">
          {t('voucher-gives-hint')}
        </p>
      </div>
      <Form.Field
        control={form.control}
        name="title"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('title')}</Form.Label>
            <Form.Control>
              <Input placeholder={t('enter-voucher-title')} {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <Form.Field
          control={form.control}
          name="type"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('type')}</Form.Label>
              <Form.Control>
                <Select onValueChange={field.onChange} value={field.value}>
                  <Select.Trigger
                    className={field.value ? '' : 'text-muted-foreground'}
                  >
                    {VOUCHER_TYPES.find((type) => type.value === field.value)
                      ?.label || t('select-voucher-type')}
                  </Select.Trigger>
                  <Select.Content>
                    {VOUCHER_TYPES.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
              <Form.Description>
                {t(`voucher-type-hint.${field.value}`, { defaultValue: '' })}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        {discounting && (
          <Form.Field
            control={form.control}
            name="value"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('voucher-discount')}</Form.Label>
                <div className="flex gap-2">
                  <Form.Control>
                    <Input
                      type="number"
                      min={0}
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
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={kind}
                    onValueChange={(next) =>
                      next && form.setValue('kind', next, { shouldDirty: true })
                    }
                  >
                    {VOUCHER_KIND_TYPES.map((option) => (
                      <ToggleGroup.Item
                        key={option.value}
                        value={option.value}
                        className="px-3"
                      >
                        {t(`voucher-kind-unit.${option.value}`)}
                      </ToggleGroup.Item>
                    ))}
                  </ToggleGroup>
                </div>
                <Form.Description>
                  {t(`voucher-discount-preview.${kind || 'amount'}`, {
                    value: value || 0,
                  })}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
      </div>
    </section>
  );
};
