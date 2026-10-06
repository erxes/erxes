import { useTranslation } from 'react-i18next';
import { FieldErrors, UseFormReturn } from 'react-hook-form';
import {
  Button,
  Form,
  Input,
  Select,
  Sheet,
  Spinner,
  Textarea,
  toast,
} from 'erxes-ui';
import {
  FIXED_ASSET_DEPRECIATION_METHODS,
  FIXED_ASSET_DEPRECIATION_METHOD_VALUES,
} from '../constants/depreciationMethods';
import { useFixedAssetCategories } from '../hooks/useFixedAssetCategories';
import { TFixedAssetForm } from '../types/FixedAsset';
import { SelectFixedAssetCategory } from './SelectFixedAssetCategory';

const NumberInput = ({
  field,
}: {
  field: { value?: number; onChange: (value?: number) => void };
}) => (
  <Input
    type="number"
    value={field.value ?? ''}
    onChange={(event) =>
      field.onChange(
        event.target.value === '' ? undefined : event.target.valueAsNumber,
      )
    }
  />
);

const roundRate = (value: number) => Math.round(value * 100) / 100;

const getRateFromUsefulLife = (usefulLife?: number) =>
  usefulLife && usefulLife > 0 ? roundRate(100 / usefulLife) : undefined;

const getUsefulLifeFromRate = (annualRate?: number) =>
  annualRate && annualRate > 0 ? roundRate(100 / annualRate) : undefined;

export const FixedAssetForm = ({
  form,
  handleSubmit,
  loading,
}: {
  form: UseFormReturn<TFixedAssetForm>;
  handleSubmit: (data: TFixedAssetForm) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('accounting');

  const { fixedAssetCategories } = useFixedAssetCategories();

  const getDepreciationMethod = (value?: string) =>
    FIXED_ASSET_DEPRECIATION_METHOD_VALUES.includes(
      value as (typeof FIXED_ASSET_DEPRECIATION_METHOD_VALUES)[number],
    )
      ? (value as (typeof FIXED_ASSET_DEPRECIATION_METHOD_VALUES)[number])
      : undefined;

  const applyCategoryDefaults = (categoryId?: string) => {
    const category = fixedAssetCategories?.find(
      (item) => item._id === categoryId,
    );

    if (!category) {
      return;
    }

    form.setValue(
      'depreciationMethod',
      getDepreciationMethod(category.depreciationMethod),
    );
    form.setValue(
      'usefulLife',
      getUsefulLifeFromRate(category.defaultAnnualDepreciationRate),
    );
    form.setValue(
      'annualDepreciationRate',
      category.defaultAnnualDepreciationRate,
    );
    form.setValue('salvageValue', category.defaultSalvageValue);
    form.setValue(
      'taxDepreciationMethod',
      getDepreciationMethod(category.taxDepreciationMethod),
    );
    form.setValue(
      'taxUsefulLife',
      getUsefulLifeFromRate(category.defaultTaxAnnualDepreciationRate),
    );
    form.setValue(
      'taxAnnualDepreciationRate',
      category.defaultTaxAnnualDepreciationRate,
    );
    form.setValue('taxSalvageValue', category.defaultTaxSalvageValue);
  };

  const handleInvalid = (errors: FieldErrors<TFixedAssetForm>) => {
    const fieldLabels: Partial<Record<keyof TFixedAssetForm, string>> = {
      name: t('name'),
      code: t('code'),
      categoryId: t('category'),
      depreciationMethod: t('depreciation-method'),
      usefulLife: t('useful-life'),
      annualDepreciationRate: t('annual-depreciation-rate'),
      salvageValue: t('residual-value'),
      taxDepreciationMethod: t('tax-depreciation-method'),
      taxUsefulLife: t('tax-useful-life'),
      taxSalvageValue: t('tax-residual-value'),
    };
    const invalidFields = Object.keys(errors).map(
      (field) => fieldLabels[field as keyof TFixedAssetForm] || field,
    );

    toast({
      title: t('required-information-is-missing'),
      description: t('review-fields', { fields: invalidFields.join(', ') }),
      variant: 'destructive',
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
        className="flex flex-col flex-1 bg-background min-h-0"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Form.Field
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('category')}</Form.Label>
                  <SelectFixedAssetCategory
                    selected={field.value}
                    onSelect={(categoryId) => {
                      field.onChange(categoryId);
                      applyCategoryDefaults(categoryId);
                    }}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="code"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('code')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="depreciationMethod"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('depreciation-method')}</Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value
                          placeholder={t('select-a-depreciation-method')}
                        />
                      </Select.Trigger>
                      <Select.Content>
                        {FIXED_ASSET_DEPRECIATION_METHODS.map((method) => (
                          <Select.Item key={method.value} value={method.value}>
                            {t(method.label)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="usefulLife"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('useful-life-years')}</Form.Label>
                  <Form.Control>
                    <NumberInput
                      field={{
                        ...field,
                        onChange: (value?: number) => {
                          field.onChange(value);
                          form.setValue(
                            'annualDepreciationRate',
                            getRateFromUsefulLife(value),
                            { shouldDirty: true, shouldValidate: true },
                          );
                        },
                      }}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="annualDepreciationRate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('annual-depreciation-rate')}</Form.Label>
                  <Form.Control>
                    <NumberInput
                      field={{
                        ...field,
                        onChange: (value?: number) => {
                          field.onChange(value);
                          form.setValue(
                            'usefulLife',
                            getUsefulLifeFromRate(value),
                            { shouldDirty: true, shouldValidate: true },
                          );
                        },
                      }}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="salvageValue"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('residual-value')}</Form.Label>
                  <Form.Control>
                    <NumberInput field={field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="taxDepreciationMethod"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('tax-depreciation-method')}</Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value
                          placeholder={t('select-a-tax-depreciation-method')}
                        />
                      </Select.Trigger>
                      <Select.Content>
                        {FIXED_ASSET_DEPRECIATION_METHODS.map((method) => (
                          <Select.Item key={method.value} value={method.value}>
                            {t(method.label)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="taxUsefulLife"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('tax-useful-life')}</Form.Label>
                  <Form.Control>
                    <NumberInput field={field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="taxSalvageValue"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('tax-residual-value')}</Form.Label>
                  <Form.Control>
                    <NumberInput field={field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item className="col-span-1 md:col-span-3">
                  <Form.Label>{t('description')}</Form.Label>
                  <Form.Control>
                    <Textarea {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>
        <Sheet.Footer className="shrink-0 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" type="button" size="lg">
              {t('cancel')}
            </Button>
          </Sheet.Close>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            {t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
