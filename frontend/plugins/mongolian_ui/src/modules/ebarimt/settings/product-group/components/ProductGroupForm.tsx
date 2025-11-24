import { UseFormReturn } from 'react-hook-form';
import { Button, Checkbox, Dialog, Form, Input, Spinner } from 'erxes-ui';
import { IconX } from '@tabler/icons-react';
import { TProductGroupForm } from '@/ebarimt/settings/product-group/constants/productGroupSchema';
import { SelectSubProduct } from '@/ebarimt/settings/product-group/components/selects/SelectSubProduct';
import { SelectMainProduct } from '@/ebarimt/settings/product-group/components/selects/SelectMainProduct';
import { useCallback } from 'react';

export const ProductGroupForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<TProductGroupForm>;
  onSubmit: (data: TProductGroupForm) => void;
  loading: boolean;
}) => {
  const handleNumberChange = useCallback(
    (value: string, onChange: (value: number) => void) => {
      let cleanedValue = '';
      for (let i = 0; i < value.length; i++) {
        const char = value[i];
        if ((char >= '0' && char <= '9') || char === '.') {
          cleanedValue += char;
        }
      }

      if (cleanedValue === '') {
        onChange(0);
        return;
      }

      if (cleanedValue === '.') {
        return;
      }

      const numericValue = Number.parseFloat(cleanedValue);

      if (!Number.isNaN(numericValue)) {
        onChange(numericValue);
      }
    },
    [],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="gap-5 flex flex-col py-3"
      >
        <Form.Field
          control={form.control}
          name="mainProductId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Main Product</Form.Label>
              <SelectMainProduct
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                disabled={loading}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="subProductId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Sub Product</Form.Label>
              <SelectSubProduct
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                disabled={loading}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="sortNum"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Sort Number</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={field.value || ''}
                  onChange={(e) =>
                    handleNumberChange(e.target.value, field.onChange)
                  }
                  placeholder="Enter sort number"
                  disabled={loading}
                />
              </Form.Control>
              <Form.Message />
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
                  type="text"
                  inputMode="decimal"
                  value={field.value || ''}
                  onChange={(e) =>
                    handleNumberChange(e.target.value, field.onChange)
                  }
                  placeholder="Enter ratio"
                  disabled={loading}
                />
              </Form.Control>
              <Form.Message />
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
                  disabled={loading}
                />
              </Form.Control>
              <Form.Label variant="peer">Is Active</Form.Label>
            </Form.Item>
          )}
        />
        <Dialog.Footer className="col-span-2 mt-3 gap-2">
          <Dialog.Close asChild>
            <Button variant="outline" size="lg" disabled={loading}>
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
