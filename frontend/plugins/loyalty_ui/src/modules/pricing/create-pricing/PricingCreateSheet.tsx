import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  Select,
  Sheet,
  useToast,
  Form,
} from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useCreatePricing } from '@/pricing/hooks/useCreatePricing';
import {
  SelectCompany,
  SelectSegment,
  SelectTags,
  SelectProduct,
} from 'ui-modules';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { SelectCategory } from '@/pricing/components/SelectCategory';
import {
  formatDateValue,
  isDateRangeValid,
  parseDateValue,
} from '@/pricing/utils/date';

interface PricingCreateSheetProps {
  trigger?: React.ReactNode;
}

interface PricingFormValues {
  name: string;
  status: 'draft';
  isPriority: boolean;
  startDate: string | null;
  endDate: string | null;
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

type TargetFieldName =
  | 'productCategoryIds'
  | 'appliesProductIds'
  | 'segmentId'
  | 'vendorCompanyIds'
  | 'productTagIds'
  | 'bundleProductIds';

const getTargetValidationError = (
  values: PricingFormValues,
): { field: TargetFieldName; message: string } | null => {
  switch (values.appliesTo) {
    case 'category':
      return values.productCategoryIds.length
        ? null
        : {
            field: 'productCategoryIds',
            message: 'Select at least one category.',
          };
    case 'product':
      return values.appliesProductIds.length
        ? null
        : {
            field: 'appliesProductIds',
            message: 'Select at least one product.',
          };
    case 'segment':
      return values.segmentId
        ? null
        : { field: 'segmentId', message: 'Select a segment.' };
    case 'vendor':
      return values.vendorCompanyIds.length
        ? null
        : { field: 'vendorCompanyIds', message: 'Select at least one vendor.' };
    case 'tag':
      return values.productTagIds.length
        ? null
        : { field: 'productTagIds', message: 'Select at least one tag.' };
    case 'bundle':
      return values.bundleProductIds.length
        ? null
        : {
            field: 'bundleProductIds',
            message: 'Select at least one bundle product.',
          };
    default:
      return null;
  }
};

export function PricingCreateSheet({ trigger }: PricingCreateSheetProps) {
  const [open, setOpen] = useState(false);
  const { createPricing, loading } = useCreatePricing();
  const { toast } = useToast();

  const form = useForm<PricingFormValues>({
    defaultValues: {
      name: '',
      status: 'draft',
      isPriority: false,
      startDate: null,
      endDate: null,
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

  const appliesTo = form.watch('appliesTo');
  const formValues = form.watch();

  useEffect(() => {
    form.clearErrors([
      'productCategoryIds',
      'appliesProductIds',
      'segmentId',
      'vendorCompanyIds',
      'productTagIds',
      'bundleProductIds',
    ]);
  }, [appliesTo, form]);

  const targetValidationError = getTargetValidationError(formValues);

  const isFormValid =
    formValues.name.trim().length > 0 &&
    isDateRangeValid(formValues.startDate, formValues.endDate) &&
    !targetValidationError;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  };

  const handleSubmit = async (values: PricingFormValues) => {
    if (!isDateRangeValid(values.startDate, values.endDate)) {
      form.setError('endDate', {
        type: 'validate',
        message: 'End date must be after start date.',
      });
      toast({
        title: 'Invalid date range',
        description: 'End date must be after start date.',
        variant: 'destructive',
      });
      return;
    }

    const targetError = getTargetValidationError(values);

    if (targetError) {
      form.setError(targetError.field, {
        type: 'validate',
        message: targetError.message,
      });
      toast({
        title: 'Missing pricing target',
        description: targetError.message,
        variant: 'destructive',
      });
      return;
    }

    try {
      const doc: Parameters<typeof createPricing>[0] = {
        name: values.name.trim(),
        status: 'draft',
        applyType: values.appliesTo,
        isPriority: values.isPriority,
      };

      if (values.startDate) {
        doc.isStartDateEnabled = true;
        doc.startDate = values.startDate;
      } else {
        doc.isStartDateEnabled = false;
      }

      if (values.endDate) {
        doc.isEndDateEnabled = true;
        doc.endDate = values.endDate;
      } else {
        doc.isEndDateEnabled = false;
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
      <Sheet.View className="flex-col h-full max-h-screen p-0 sm:max-w-md">
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
            <div className="flex-1 min-h-0 px-5 py-5 space-y-4 overflow-y-auto">
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
                name="isPriority"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Priority</Form.Label>
                    <Form.Control>
                      <div className="flex items-center h-9">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                      </div>
                    </Form.Control>
                  </Form.Item>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Form.Field
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Start date</Form.Label>
                      <Form.Control>
                        <DatePicker
                          value={parseDateValue(field.value)}
                          placeholder="Select start date"
                          onChange={(value) =>
                            field.onChange(
                              formatDateValue(
                                value instanceof Date ? value : undefined,
                              ),
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
                  name="endDate"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>End date</Form.Label>
                      <Form.Control>
                        <DatePicker
                          value={parseDateValue(field.value)}
                          placeholder="Select end date"
                          onChange={(value) =>
                            field.onChange(
                              formatDateValue(
                                value instanceof Date ? value : undefined,
                              ),
                            )
                          }
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t" />
                <Form.Label className="mx-2">More Info</Form.Label>
                <div className="flex-1 border-t" />
              </div>

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
                        <Form.Label>
                          PRODUCT CATEGORIES{' '}
                          <span className="text-destructive">*</span>
                        </Form.Label>
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
                        <Form.Message />
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
                        <Form.Message />
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
                        <Form.Message />
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
                      <Form.Label>
                        PRODUCTS <span className="text-destructive">*</span>
                      </Form.Label>
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
                      <Form.Message />
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
                      <Form.Label>
                        SEGMENT <span className="text-destructive">*</span>
                      </Form.Label>
                      <Form.Control>
                        <SelectSegment
                          selected={field.value || undefined}
                          onSelect={(id) => field.onChange(id)}
                        />
                      </Form.Control>
                      <Form.Message />
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
                      <Form.Label>
                        VENDORS <span className="text-destructive">*</span>
                      </Form.Label>
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
                      <Form.Message />
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
                        <Form.Label>
                          PRODUCT TAGS{' '}
                          <span className="text-destructive">*</span>
                        </Form.Label>
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
                        <Form.Message />
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
                        <Form.Message />
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
                      <Form.Label>
                        PRODUCTS TO BUNDLE{' '}
                        <span className="text-destructive">*</span>
                      </Form.Label>
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
                      <Form.Message />
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
