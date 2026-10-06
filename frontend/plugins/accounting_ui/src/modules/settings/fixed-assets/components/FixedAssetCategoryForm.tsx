import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import {
  Button,
  Form,
  Input,
  Select,
  Sheet,
  Spinner,
  Textarea,
} from 'erxes-ui';
import { FIXED_ASSET_DEPRECIATION_METHODS } from '../constants/depreciationMethods';
import { TFixedAssetCategoryForm } from '../types/FixedAsset';
import { SelectFixedAssetCategory } from './SelectFixedAssetCategory';

const roundRate = (value: number) => Math.round(value * 100) / 100;

const getRateFromUsefulLife = (usefulLife?: number) =>
  usefulLife && usefulLife > 0 ? roundRate(100 / usefulLife) : undefined;

const getUsefulLifeFromRate = (annualRate?: number) =>
  annualRate && annualRate > 0 ? roundRate(100 / annualRate) : undefined;

const NumberInput = ({
  field,
  onValueChange,
}: {
  field: { value?: number; onChange: (value?: number) => void };
  onValueChange?: (value?: number) => void;
}) => (
  <Input
    type="number"
    value={field.value ?? ''}
    onChange={(event) => {
      const value =
        event.target.value === '' ? undefined : event.target.valueAsNumber;

      field.onChange(value);
      onValueChange?.(value);
    }}
  />
);

export const FixedAssetCategoryForm = ({
  form,
  handleSubmit,
  loading,
}: {
  form: UseFormReturn<TFixedAssetCategoryForm>;
  handleSubmit: (data: TFixedAssetCategoryForm) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col flex-1 bg-background min-h-0"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Form.Field
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('parent-category')}</Form.Label>
                  <SelectFixedAssetCategory
                    recordId={field.value}
                    selected={field.value}
                    onSelect={field.onChange}
                    nullable
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
              name="defaultUsefulLife"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('useful-life-years')}</Form.Label>
                  <Form.Control>
                    <NumberInput
                      field={field}
                      onValueChange={(value) =>
                        form.setValue(
                          'defaultAnnualDepreciationRate',
                          getRateFromUsefulLife(value),
                          { shouldDirty: true, shouldValidate: true },
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
              name="defaultAnnualDepreciationRate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('annual-depreciation-rate')}</Form.Label>
                  <Form.Control>
                    <NumberInput
                      field={field}
                      onValueChange={(value) =>
                        form.setValue(
                          'defaultUsefulLife',
                          getUsefulLifeFromRate(value),
                          { shouldDirty: true, shouldValidate: true },
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
              name="defaultSalvageValue"
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
              name="defaultTaxUsefulLife"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('tax-useful-life-years')}</Form.Label>
                  <Form.Control>
                    <NumberInput
                      field={field}
                      onValueChange={(value) =>
                        form.setValue(
                          'defaultTaxAnnualDepreciationRate',
                          getRateFromUsefulLife(value),
                          { shouldDirty: true, shouldValidate: true },
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
              name="defaultTaxAnnualDepreciationRate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('annual-tax-depreciation-rate')}</Form.Label>
                  <Form.Control>
                    <NumberInput
                      field={field}
                      onValueChange={(value) =>
                        form.setValue(
                          'defaultTaxUsefulLife',
                          getUsefulLifeFromRate(value),
                          { shouldDirty: true, shouldValidate: true },
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
              name="defaultTaxSalvageValue"
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
            {t('save-category')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
