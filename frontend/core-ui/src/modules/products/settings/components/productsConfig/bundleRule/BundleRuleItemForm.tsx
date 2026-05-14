import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Form, Input, Checkbox, Select } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IBundleRuleItem } from './types';
import { SelectProductsBulk } from 'ui-modules';
import { useEffect, useState } from 'react';
import { useBundleConditions } from '@/products/settings/hooks/useBundleConditions';

const bundleRuleItemSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  productIds: z.array(z.string()).min(1, 'At least one product is required'),
  priceType: z.string().min(1, 'Price type is required'),
  priceAdjustType: z.string().min(1, 'Price adjust type is required'),
  priceAdjustFactor: z.string().min(1, 'Price adjust factor is required'),
  quantity: z.number().min(1, 'Quantity is required'),
  percent: z.number().min(1, 'Percent is required'),
  allowSkip: z.boolean().optional(),
});

interface IBundleRuleItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof bundleRuleItemSchema>) => void;
  editingItem?: IBundleRuleItem;
  editingIndex?: number | null;
}

export const BundleRuleItemForm = ({
  open,
  onOpenChange,
  onSubmit,
  editingItem,
  editingIndex,
}: IBundleRuleItemFormProps) => {
  const [selectedProducts, setSelectedProducts] = useState<
    { _id: string; name: string }[]
  >([]);

  const itemForm = useForm<z.infer<typeof bundleRuleItemSchema>>({
    defaultValues: {
      code: '',
      productIds: [],
      priceType: '',
      priceAdjustType: 'none',
      priceAdjustFactor: '',
      quantity: 0,
      percent: 0,
      allowSkip: false,
    },
    resolver: zodResolver(bundleRuleItemSchema),
  });

  const { bundleConditions } = useBundleConditions();

  const bundleConditionOptions =
    bundleConditions
      ?.filter((condition) => Boolean(condition?.code))
      .map((condition) => ({
        value: condition.code as string,
        label: condition.code as string,
      })) || [];

  useEffect(() => {
    if (editingItem) {
      itemForm.reset(editingItem);
      setSelectedProducts(editingItem.products || []);
    } else {
      itemForm.reset({
        code: '',
        productIds: [],
        priceType: '',
        priceAdjustType: 'none',
        priceAdjustFactor: '',
        quantity: 0,
        percent: 0,
        allowSkip: false,
      });
      setSelectedProducts([]);
    }
  }, [editingItem, itemForm]);

  const handleClose = () => {
    itemForm.reset();
    onOpenChange(false);
  };

  const handleSubmit = (data: z.infer<typeof bundleRuleItemSchema>) => {
    onSubmit(data);
    itemForm.reset();
  };

  const onAddProducts = (selectedProducts: any[]) => {
    const productIds = selectedProducts.map((p) => p._id);
    itemForm.setValue('productIds', productIds);
    setSelectedProducts(selectedProducts);
  };

  const selectedProductsLabel = (() => {
    if (!selectedProducts.length) {
      return 'Choose Product & service';
    }

    const names = selectedProducts.map((p) => p.name).filter(Boolean);
    const visibleNames = names.slice(0, 3);
    const remaining = names.length - visibleNames.length;

    if (visibleNames.length === 0) {
      const count = selectedProducts.length;
      return count === 1 ? '1 product' : `${count} products`;
    }

    return remaining > 0
      ? `${visibleNames.join(', ')} +${remaining}`
      : visibleNames.join(', ');
  })();

  const priceTypeOptions = [
    { value: 'thisProductPricePercent', label: 'thisProductPricePercent' },
    { value: 'mainPricePercent', label: 'mainPricePercent' },
    { value: 'price', label: 'price' },
  ];

  const priceAdjustTypeOptions = [
    { value: 'none', label: 'None' },
    { value: 'default', label: 'Default' },
    { value: 'round', label: 'Round' },
    { value: 'floor', label: 'Floor' },
    { value: 'ceil', label: 'Ceil' },
    { value: 'endsWith9', label: 'Ends With 9' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="flex overflow-hidden flex-col">
        <Dialog.Header>
          <Dialog.Title>
            {editingIndex !== null && editingIndex !== undefined
              ? 'Edit Bundle Rule Item'
              : 'Add Bundle Rule Item'}
          </Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        <Form {...itemForm}>
          <form onSubmit={itemForm.handleSubmit(handleSubmit)}>
            <div className="flex flex-col gap-4 w-full">
              <Form.Field
                control={itemForm.control}
                name="code"
                render={({ field }) => (
                  <Form.Item className="w-full">
                    <Form.Label>
                      Code <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select Bundle Condition" />
                        </Select.Trigger>
                        <Select.Content>
                          {bundleConditionOptions.map((option) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
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
                control={itemForm.control}
                name="productIds"
                render={() => (
                  <Form.Item className="flex flex-col gap-1 w-full">
                    <Form.Label>
                      Products <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <SelectProductsBulk
                        productIds={itemForm.watch('productIds') || []}
                        onSelect={(_, selectedProducts) =>
                          onAddProducts(selectedProducts || [])
                        }
                      >
                        <Button variant="secondary" className="overflow-hidden">
                          {selectedProductsLabel}
                        </Button>
                      </SelectProductsBulk>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={itemForm.control}
                name="priceType"
                render={({ field }) => (
                  <Form.Item className="w-full">
                    <Form.Label>
                      Price Type <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select Price Type" />
                        </Select.Trigger>
                        <Select.Content>
                          {priceTypeOptions.map((option) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
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
                control={itemForm.control}
                name="priceAdjustType"
                render={({ field }) => (
                  <Form.Item className="w-full">
                    <Form.Label>
                      Price Adjust Type{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select Price Adjust Type" />
                        </Select.Trigger>
                        <Select.Content>
                          {priceAdjustTypeOptions.map((option) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
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
                control={itemForm.control}
                name="priceAdjustFactor"
                render={({ field }) => (
                  <Form.Item className="w-full">
                    <Form.Label>
                      Price Adjust Factor{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        placeholder="Price Adjust Factor"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="flex gap-2">
                <Form.Field
                  control={itemForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <Form.Item className="w-full">
                      <Form.Label>
                        Quantity <span className="text-destructive">*</span>
                      </Form.Label>
                      <Form.Control>
                        <Input
                          type="number"
                          placeholder="Quantity"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={itemForm.control}
                  name="percent"
                  render={({ field }) => (
                    <Form.Item className="w-full">
                      <Form.Label>
                        Percent <span className="text-destructive">*</span>
                      </Form.Label>
                      <Form.Control>
                        <Input
                          type="number"
                          placeholder="Percent"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>

              <Form.Field
                control={itemForm.control}
                name="allowSkip"
                render={({ field }) => (
                  <Form.Item className="flex gap-2 space-items-center">
                    <Form.Control>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label className="mb-0">Allow Skip</Form.Label>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
            <Dialog.Footer className="flex gap-1 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingIndex !== null && editingIndex !== undefined
                  ? 'Update'
                  : 'Add'}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
