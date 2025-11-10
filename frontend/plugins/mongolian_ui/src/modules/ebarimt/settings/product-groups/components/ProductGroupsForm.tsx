import { UseFormReturn } from 'react-hook-form';
import {
  Button,
  Checkbox,
  Dialog,
  Form,
  Input,
  Select,
  Spinner,
} from 'erxes-ui';
import { IconX } from '@tabler/icons-react';
import {
  ProductCategory,
  IProductGroup,
} from '../constants/productGroupsDefaultValues';

export const ProductGroupsForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<IProductGroup>;
  onSubmit: (data: IProductGroup) => void;
  loading: boolean;
}) => {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="gap-5 flex flex-col py-3"
      >
        <Form.Field
          control={form.control}
          name="mainProducts"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Main Product</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a main product" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(ProductCategory).map((kind) => (
                    <Select.Item key={kind} value={kind} className="capitalize">
                      {kind}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="subProducts"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Sub Product</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a sub product" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(ProductCategory).map((kind) => (
                    <Select.Item key={kind} value={kind} className="capitalize">
                      {kind}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="sortNumber"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Sort Number</Form.Label>
              <Form.Control>
                <Input
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="ratio"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Ratio</Form.Label>
              <Form.Control>
                <Input
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <Form.Item className="col-span-2 flex items-center gap-2 space-y-0 mt-2">
              <Form.Control>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Form.Label variant="peer">Is Active</Form.Label>
            </Form.Item>
          )}
        />
        <Dialog.Footer className="col-span-2 mt-3 gap-2">
          <Dialog.Close asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Dialog.Close>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <Spinner /> : 'Save'}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};

export const ProductGroupDialog = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
    <Dialog.Content className="max-w-2xl">
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description className="sr-only">
          {description}
        </Dialog.Description>
        <Dialog.Close asChild>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-3"
          >
            <IconX />
          </Button>
        </Dialog.Close>
      </Dialog.Header>
      {children}
    </Dialog.Content>
  );
};
