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

export const FixedAssetCategoryForm = ({
  form,
  handleSubmit,
  loading,
}: {
  form: UseFormReturn<TFixedAssetCategoryForm>;
  handleSubmit: (data: TFixedAssetCategoryForm) => void;
  loading: boolean;
}) => {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="py-4 grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        <Form.Field
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Эцэг бүлэг</Form.Label>
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
          name="defaultUsefulLife"
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
          name="defaultSalvageValue"
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
          name="defaultTaxUsefulLife"
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
          name="defaultTaxSalvageValue"
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
            Бүлэг хадгалах
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
