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
import { productCategories, IEBarimt } from '../constants/ebarimtDefaultValues';

export const EBarimtForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<IEBarimt>;
  onSubmit: (data: IEBarimt) => void;
  loading: boolean;
}) => {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="gap-5 grid grid-cols-2 py-3"
      >
        <Form.Field
          control={form.control}
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Title</Form.Label>
              <Form.Control>
                <Input
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="productCategories"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Product Categories</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a product category" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(productCategories).map((kind) => (
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
          name="taxType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Tax Type</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a tax type" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(productCategories).map((kind) => (
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
          name="excludeCategories"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Exclude Categories</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a exclude category" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(productCategories).map((kind) => (
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
          name="taxCode"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Tax Code</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a tax code" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(productCategories).map((kind) => (
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
          name="products"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Products</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a products" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(productCategories).map((kind) => (
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
          name="kind"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Kind</Form.Label>
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
          name="excludeProducts"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Exclude Products</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a exclude products" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(productCategories).map((kind) => (
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
          name="percent"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Percent</Form.Label>
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
          name="tags"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Tags</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a tags" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(productCategories).map((kind) => (
                    <Select.Item key={kind} value={kind} className="capitalize">
                      {kind}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />{' '}
        <Form.Field
          control={form.control}
          name="excludeTags"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Exclude Tags</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a exclude tags" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(productCategories).map((kind) => (
                    <Select.Item key={kind} value={kind} className="capitalize">
                      {kind}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
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

export const EBarimtDialog = ({
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
