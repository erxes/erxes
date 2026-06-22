import { UseFormReturn } from 'react-hook-form';
import { Button, Form, Input, Sheet, Spinner, Textarea } from 'erxes-ui';
import { TFixedAssetForm } from '../types/FixedAsset';
import { SelectFixedAssetCategory } from './SelectFixedAssetCategory';
import { FixedAssetAccountFields } from './FixedAssetAccountFields';

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
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="py-4 grid grid-cols-2 gap-5"
      >
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
          name="categoryId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Бүлэг</Form.Label>
              <SelectFixedAssetCategory
                selected={field.value}
                onSelect={field.onChange}
              />
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
                <Input {...field} />
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
                <Input {...field} />
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
            <Form.Item className="col-span-2">
              <Form.Label>Тайлбар</Form.Label>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <FixedAssetAccountFields form={form} />
        <Sheet.Footer className="col-span-2 mt-4">
          <Sheet.Close asChild>
            <Button variant="outline" type="button" size="lg">
              Болих
            </Button>
          </Sheet.Close>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Хөрөнгө хадгалах
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
