import { Button, Input, Select, Sheet, useToast, Form } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useCreatePricing } from '@/pricing/hooks/useCreatePricing';
import {
  DISCOUNT_TYPES,
  DiscountType,
  PRICE_ADJUST_TYPES,
  PriceAdjustType,
} from '@/pricing/edit-pricing/components';
import {
  SelectCompany,
  SelectSegment,
  SelectTags,
  SelectProduct,
} from 'ui-modules';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { SelectCategory } from '@/pricing/components/SelectCategory';

interface PricingCreateSheetProps {
  trigger?: React.ReactNode;
}

interface PricingFormValues {
  name: string;
  status: 'active' | 'archived' | 'draft' | 'completed' | '';
  discountType: DiscountType;
  discountValue: number;
  priceAdjustType: PriceAdjustType;
  priceAdjustFactor: number;
  bonusProductId: string;
  appliesTo: 'category' | 'product' | 'segment' | 'vendor' | 'tag' | 'bundle';
  productCategoryIds: string[];
  excludeCategoryIds: string[];
  excludeProductIds: string[];
  appliesProductIds: string[];
  segmentId: string;
  vendorCompanyIds: string[];
  productTagIds: string[];
  excludeTagIds: string[];
  bundleProductIds: string[];
}

export function PricingCreateSheet({ trigger }: PricingCreateSheetProps) {
  const [open, setOpen] = useState(false);
  const { createPricing, loading } = useCreatePricing();
  const { toast } = useToast();

  const form = useForm<PricingFormValues>({
    defaultValues: {
      name: '',
      status: '',
      discountType: 'fixed',
      discountValue: 0,
      priceAdjustType: 'none',
      priceAdjustFactor: 0,
      bonusProductId: '',
      appliesTo: 'category',
      productCategoryIds: [],
      excludeCategoryIds: [],
      excludeProductIds: [],
      appliesProductIds: [],
      segmentId: '',
      vendorCompanyIds: [],
      productTagIds: [],
      excludeTagIds: [],
      bundleProductIds: [],
    },
  });

  const discountType = form.watch('discountType');
  const appliesTo = form.watch('appliesTo');
  const name = form.watch('name');
  const status = form.watch('status');

  const isFormValid = name.trim() !== '' && status !== '';

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  };

  const handleSubmit = async (values: PricingFormValues) => {
    try {
      const appliesToApplyTypeMap: Record<string, string> = {
        category: 'category',
        product: 'product',
        segment: 'segment',
        vendor: 'vendor',
        tag: 'tag',
        bundle: 'bundle',
      };

      const doc: any = {
        name: values.name.trim(),
        status: values.status || 'active',
        type: values.discountType,
        value: values.discountValue,
        priceAdjustType: values.priceAdjustType,
        priceAdjustFactor: values.priceAdjustFactor,
        applyType: appliesToApplyTypeMap[values.appliesTo],
      };

      if (values.discountType === 'bonus' && values.bonusProductId) {
        doc.bonusProduct = values.bonusProductId;
      }

      if (values.appliesTo === 'category') {
        doc.categories = values.productCategoryIds;
        doc.categoriesExcluded = values.excludeCategoryIds;
        doc.productsExcluded = values.excludeProductIds;
      }

      if (values.appliesTo === 'product') {
        doc.products = values.appliesProductIds;
      }

      if (values.appliesTo === 'segment' && values.segmentId) {
        doc.segments = [values.segmentId];
      }

      if (values.appliesTo === 'vendor') {
        doc.vendors = values.vendorCompanyIds;
      }

      if (values.appliesTo === 'tag') {
        doc.tags = values.productTagIds;
        doc.tagsExcluded = values.excludeTagIds;
        doc.productsExcluded = values.excludeProductIds;
      }

      if (values.appliesTo === 'bundle' && values.bundleProductIds.length) {
        doc.productsBundle = [values.bundleProductIds];
      }

      await createPricing(doc);

      toast({
        title: 'Pricing created',
        description: 'New pricing has been created successfully.',
      });

      handleOpenChange(false);
    } catch {
      toast({
        title: 'Failed to create pricing',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const defaultTrigger = (
    <Button>
      <IconPlus />
      Create Pricing
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.Trigger asChild>{trigger ?? defaultTrigger}</Sheet.Trigger>
      <Sheet.View className="flex-col p-0 h-full max-h-screen sm:max-w-md">
        <Sheet.Header className="px-5 shrink-0">
          <Sheet.Title className="text-lg font-bold">
            Create Pricing
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1 min-h-0 bg-background"
          >
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4 min-h-0">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      Name <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input placeholder="Enter pricing name" {...field} />
                    </Form.Control>
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      Status <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger className="bg-background">
                          <Select.Value placeholder="Select status" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="active">Active</Select.Item>
                          <Select.Item value="archived">Archived</Select.Item>
                          <Select.Item value="draft">Draft</Select.Item>
                          <Select.Item value="completed">Completed</Select.Item>
                        </Select.Content>
                      </Select>
                    </Form.Control>
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Discount type</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger className="bg-background">
                          <Select.Value placeholder="Select discount type" />
                        </Select.Trigger>
                        <Select.Content>
                          {DISCOUNT_TYPES.map((option) => (
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
                  </Form.Item>
                )}
              />

              {discountType !== 'bonus' && (
                <>
                  <Form.Field
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Discount value</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                            placeholder="0"
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="priceAdjustType"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Price adjust type</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger className="bg-background">
                              <Select.Value placeholder="None" />
                            </Select.Trigger>
                            <Select.Content>
                              {PRICE_ADJUST_TYPES.map((option) => (
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
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="priceAdjustFactor"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Price adjust factor</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                            placeholder="0"
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </>
              )}

              {discountType === 'bonus' && (
                <Form.Field
                  control={form.control}
                  name="bonusProductId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Bonus product</Form.Label>
                      <Form.Control>
                        <SelectProduct
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(
                              Array.isArray(value) ? value[0] : value,
                            )
                          }
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
              )}

              <Form.Field
                control={form.control}
                name="appliesTo"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>APPLIES TO</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger className="bg-background">
                          <Select.Value placeholder="Select target" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="category">
                            Specific Category
                          </Select.Item>
                          <Select.Item value="product">
                            Specific Product
                          </Select.Item>
                          <Select.Item value="segment">
                            Specific Segment
                          </Select.Item>
                          <Select.Item value="vendor">
                            Specific Vendor
                          </Select.Item>
                          <Select.Item value="tag">Specific Tag</Select.Item>
                          <Select.Item value="bundle">
                            Specific Bundle
                          </Select.Item>
                        </Select.Content>
                      </Select>
                    </Form.Control>
                  </Form.Item>
                )}
              />

              {appliesTo === 'category' && (
                <div className="space-y-4">
                  <Form.Field
                    control={form.control}
                    name="productCategoryIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>PRODUCT CATEGORIES</Form.Label>
                        <Form.Control>
                          <SelectCategory
                            mode="multiple"
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(
                                Array.isArray(value) ? value : [value],
                              )
                            }
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="excludeCategoryIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>EXCLUDE CATEGORIES</Form.Label>
                        <Form.Control>
                          <SelectCategory
                            mode="multiple"
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(
                                Array.isArray(value) ? value : [value],
                              )
                            }
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="excludeProductIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>EXCLUDE PRODUCTS</Form.Label>
                        <Form.Control>
                          <SelectProduct
                            mode="multiple"
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(
                                Array.isArray(value) ? value : [value],
                              )
                            }
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>
              )}

              {appliesTo === 'product' && (
                <Form.Field
                  control={form.control}
                  name="appliesProductIds"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>PRODUCTS</Form.Label>
                      <Form.Control>
                        <SelectProduct
                          mode="multiple"
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(
                              Array.isArray(value) ? value : [value],
                            )
                          }
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
              )}

              {appliesTo === 'segment' && (
                <Form.Field
                  control={form.control}
                  name="segmentId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>SEGMENT</Form.Label>
                      <Form.Control>
                        <SelectSegment
                          selected={field.value || undefined}
                          onSelect={(id) => field.onChange(id)}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
              )}

              {appliesTo === 'vendor' && (
                <Form.Field
                  control={form.control}
                  name="vendorCompanyIds"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>VENDORS</Form.Label>
                      <Form.Control>
                        <SelectCompany
                          mode="multiple"
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(
                              Array.isArray(value) ? value : [value],
                            )
                          }
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
              )}

              {appliesTo === 'tag' && (
                <div className="space-y-4">
                  <Form.Field
                    control={form.control}
                    name="productTagIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>PRODUCT TAGS</Form.Label>
                        <Form.Control>
                          <SelectTags
                            tagType="sales:product"
                            mode="multiple"
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(value as string[])
                            }
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="excludeTagIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>EXCLUDE TAGS</Form.Label>
                        <Form.Control>
                          <SelectTags
                            tagType="sales:product"
                            mode="multiple"
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(value as string[])
                            }
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="excludeProductIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>EXCLUDE PRODUCTS</Form.Label>
                        <Form.Control>
                          <SelectProduct
                            mode="multiple"
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(
                                Array.isArray(value) ? value : [value],
                              )
                            }
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>
              )}

              {appliesTo === 'bundle' && (
                <Form.Field
                  control={form.control}
                  name="bundleProductIds"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>PRODUCTS TO BUNDLE</Form.Label>
                      <Form.Control>
                        <SelectProduct
                          mode="multiple"
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(
                              Array.isArray(value) ? value : [value],
                            )
                          }
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
              )}
            </div>

            <Sheet.Footer className="px-5 py-4 border-t bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !isFormValid}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
