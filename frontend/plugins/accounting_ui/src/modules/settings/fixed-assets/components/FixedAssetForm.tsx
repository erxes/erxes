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

export const FixedAssetForm = ({
  form,
  handleSubmit,
  loading,
}: {
  form: UseFormReturn<TFixedAssetForm>;
  handleSubmit: (data: TFixedAssetForm) => void;
  loading: boolean;
}) => {
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
    form.setValue('usefulLife', category.defaultUsefulLife);
    form.setValue('salvageValue', category.defaultSalvageValue);
    form.setValue(
      'taxDepreciationMethod',
      getDepreciationMethod(category.taxDepreciationMethod),
    );
    form.setValue('taxUsefulLife', category.defaultTaxUsefulLife);
    form.setValue('taxSalvageValue', category.defaultTaxSalvageValue);
  };

  const handleInvalid = (errors: FieldErrors<TFixedAssetForm>) => {
    const fieldLabels: Partial<Record<keyof TFixedAssetForm, string>> = {
      name: 'Нэр',
      code: 'Код',
      categoryId: 'Бүлэг',
      depreciationMethod: 'Элэгдлийн арга',
      usefulLife: 'Ашиглах хугацаа',
      salvageValue: 'Үлдэх өртөг',
      taxDepreciationMethod: 'Татварын элэгдлийн арга',
      taxUsefulLife: 'Татварын ашиглах хугацаа',
      taxSalvageValue: 'Татварын үлдэх өртөг',
    };
    const invalidFields = Object.keys(errors).map(
      (field) => fieldLabels[field as keyof TFixedAssetForm] || field,
    );

    toast({
      title: 'Мэдээлэл дутуу байна',
      description: `Шалгах талбар: ${invalidFields.join(', ')}`,
      variant: 'destructive',
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
        className="py-4 grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        <Form.Field
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Бүлэг</Form.Label>
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
              <Form.Label>Код</Form.Label>
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
              <Form.Label>Нэр</Form.Label>
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
              <Form.Label>Элэгдлийн арга</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Элэгдлийн арга сонгох" />
                  </Select.Trigger>
                  <Select.Content>
                    {FIXED_ASSET_DEPRECIATION_METHODS.map((method) => (
                      <Select.Item key={method.value} value={method.value}>
                        {method.label}
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
              <Form.Label>Ашиглах хугацаа</Form.Label>
              <Form.Control>
                <NumberInput field={field} />
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
              <Form.Label>Үлдэх өртөг</Form.Label>
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
              <Form.Label>Татварын элэгдлийн арга</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Татварын элэгдлийн арга сонгох" />
                  </Select.Trigger>
                  <Select.Content>
                    {FIXED_ASSET_DEPRECIATION_METHODS.map((method) => (
                      <Select.Item key={method.value} value={method.value}>
                        {method.label}
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
              <Form.Label>Татварын ашиглах хугацаа</Form.Label>
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
              <Form.Label>Татварын үлдэх өртөг</Form.Label>
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
              <Form.Label>Тайлбар</Form.Label>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Sheet.Footer className="col-span-1 md:col-span-3 mt-4">
          <Sheet.Close asChild>
            <Button variant="outline" type="button" size="lg">
              Болих
            </Button>
          </Sheet.Close>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Хадгалах
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
