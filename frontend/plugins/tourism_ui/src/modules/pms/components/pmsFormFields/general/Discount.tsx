import { UseFormReturn, useFieldArray, useWatch } from 'react-hook-form';
import { Button, Form, Input, Select } from 'erxes-ui';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { PmsBranchFormType } from '@/pms/constants/formSchema';
import { PMS_DISCOUNT_TYPE_OPTIONS } from '@/pms/constants/discount.constants';
import { IPmsPricingPlan } from '@/pms/hooks/usePmsPricingPlans';
import { SelectPricingPlan } from './SelectPricingPlan';

const Discount = ({ form }: { form: UseFormReturn<PmsBranchFormType> }) => {
  const { t } = useTranslation('tourism');
  const { control, getValues, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'discount',
  });
  const rows = useWatch({ control, name: 'discount' });

  // Each target takes a single plan, so a target already spoken for elsewhere
  // is not offered again.
  const takenTypes = (rows || []).map((row) => row?.type).filter(Boolean);

  // Saved branches may still hold duplicate targets, so the schema error needs
  // a home outside the per-row fields.
  const discountError = form.formState.errors.discount;
  const discountMessage =
    discountError?.root?.message || discountError?.message;

  const handlePricingPlanChange = (
    index: number,
    pricingPlan: IPmsPricingPlan,
  ) => {
    setValue(`discount.${index}.config`, pricingPlan._id, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!getValues(`discount.${index}.title`)?.trim()) {
      setValue(`discount.${index}.title`, pricingPlan.name, {
        shouldDirty: true,
      });
    }
  };

  const availableTypes = PMS_DISCOUNT_TYPE_OPTIONS.filter(
    ({ value }) => !takenTypes.includes(value),
  );

  return (
    <div className="space-y-4">
      <Button
        type="button"
        disabled={availableTypes.length === 0}
        onClick={() =>
          append({ type: availableTypes[0]?.value, title: '', config: '' })
        }
      >
        <IconPlus />
        {t('add-discount')}
      </Button>

      {discountMessage && (
        <p className="text-sm text-destructive">{discountMessage}</p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4 items-end">
          <div className="grid grid-cols-3 gap-4 w-full">
            <Form.Field
              control={control}
              name={`discount.${index}.type`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('applies-to')}</Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder={t('choose-discount-type')} />
                      </Select.Trigger>
                      <Select.Content>
                        {PMS_DISCOUNT_TYPE_OPTIONS.map(
                          ({ value, labelKey }) => (
                            <Select.Item
                              key={value}
                              value={value}
                              disabled={
                                value !== field.value &&
                                takenTypes.includes(value)
                              }
                            >
                              {t(labelKey)}
                            </Select.Item>
                          ),
                        )}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={control}
              name={`discount.${index}.title`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('title')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={control}
              name={`discount.${index}.config`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('pricing-plan')}</Form.Label>
                  <Form.Control>
                    <SelectPricingPlan
                      value={field.value}
                      onValueChange={(pricingPlan) =>
                        handlePricingPlanChange(index, pricingPlan)
                      }
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </div>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="w-8 h-8"
            onClick={() => remove(index)}
          >
            <IconTrash />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default Discount;
