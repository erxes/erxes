import { SelectCategory } from '@/pricing/components/SelectCategory';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { IPricingPlanDetail } from '@/pricing/types';
import {
  formatDateValue,
  isDateRangeValid,
  parseDateValue,
} from '@/pricing/utils/date';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  InfoCard,
  Input,
  Select,
  useToast,
} from 'erxes-ui';
import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import {
  SelectCompany,
  SelectProduct,
  SelectSegment,
  SelectTags,
} from 'ui-modules';
import { type Control } from 'react-hook-form';

interface GeneralInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

interface GeneralFormValues {
  name: string;
  status: 'active' | 'archived' | 'draft' | 'completed';
  applyType: 'category' | 'product' | 'order';
  isPriority: boolean;
  startDate: string | null;
  endDate: string | null;
  appliesTo: 'category' | 'product' | 'segment' | 'vendor' | 'tag' | 'bundle';
  productCategoryIds: string[];
  excludeCategoryIds: string[];
  excludeProductIds: string[];
  appliesProductIds: string[];
  segmentId: string | null;
  vendorCompanyIds: string[];
  productTagIds: string[];
  excludeTagIds: string[];
  bundleProductIds: string[];
}

const GENERAL_FORM_ID = 'pricing-general-form';

const appliesToApplyTypeMap: Record<GeneralFormValues['appliesTo'], string> = {
  category: 'category',
  product: 'product',
  segment: 'segment',
  vendor: 'vendor',
  tag: 'tag',
  bundle: 'bundle',
};

const normalizeMultipleValue = (value: string | string[]) =>
  Array.isArray(value) ? value : [value];

const GeneralDateField = ({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<GeneralFormValues>;
  name: 'startDate' | 'endDate';
  label: string;
  placeholder: string;
}) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item className="min-w-0">
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <DatePicker
            value={parseDateValue(field.value)}
            placeholder={placeholder}
            onChange={(value) => {
              field.onChange(
                value instanceof Date ? formatDateValue(value) : null,
              );
            }}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const GeneralInfo = ({
  pricingId,
  pricingDetail,
  onSaveActionChange,
}: GeneralInfoProps) => {
  const form = useForm<GeneralFormValues>({
    defaultValues: {
      name: '',
      status: 'active',
      applyType: 'product',
      isPriority: false,
      startDate: null,
      endDate: null,
      appliesTo: 'category',
      productCategoryIds: [],
      excludeCategoryIds: [],
      excludeProductIds: [],
      appliesProductIds: [],
      segmentId: null,
      vendorCompanyIds: [],
      productTagIds: [],
      excludeTagIds: [],
      bundleProductIds: [],
    },
  });

  const appliesTo = form.watch('appliesTo');

  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();

  const { isDirty } = form.formState;

  useEffect(() => {
    if (!pricingDetail) return;

    const applyTypeToAppliesToMap: Record<
      string,
      GeneralFormValues['appliesTo']
    > = {
      category: 'category',
      product: 'product',
      segment: 'segment',
      vendor: 'vendor',
      tag: 'tag',
      bundle: 'bundle',
    };
    const appliesTo: GeneralFormValues['appliesTo'] =
      applyTypeToAppliesToMap[pricingDetail.applyType] || 'category';

    form.reset({
      name: pricingDetail.name || '',
      status: (pricingDetail.status as GeneralFormValues['status']) || 'active',
      applyType:
        (pricingDetail.applyType as GeneralFormValues['applyType']) ||
        'product',
      isPriority: pricingDetail.isPriority ?? false,
      startDate:
        pricingDetail.isStartDateEnabled && pricingDetail.startDate
          ? pricingDetail.startDate.slice(0, 10)
          : null,
      endDate:
        pricingDetail.isEndDateEnabled && pricingDetail.endDate
          ? pricingDetail.endDate.slice(0, 10)
          : null,
      appliesTo,
      productCategoryIds: pricingDetail.categories || [],
      excludeCategoryIds: pricingDetail.categoriesExcluded || [],
      excludeProductIds: pricingDetail.productsExcluded || [],
      appliesProductIds: pricingDetail.products || [],
      segmentId: pricingDetail.segments?.[0] || null,
      vendorCompanyIds: pricingDetail.vendors || [],
      productTagIds: pricingDetail.tags || [],
      excludeTagIds: pricingDetail.tagsExcluded || [],
      bundleProductIds: pricingDetail.productsBundle?.[0] || [],
    });
  }, [pricingDetail, form]);

  const handleSubmit = async (values: GeneralFormValues) => {
    if (!pricingId) return;

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

    form.clearErrors(['startDate', 'endDate']);

    const baseDoc: Parameters<typeof editPricing>[0] = {
      _id: pricingId,
      name: values.name.trim(),
      status: values.status,
      applyType: appliesToApplyTypeMap[values.appliesTo] || values.applyType,
      isPriority: values.isPriority,
    };

    if (values.startDate) {
      baseDoc.isStartDateEnabled = true;
      baseDoc.startDate = values.startDate;
    } else {
      baseDoc.isStartDateEnabled = false;
    }

    if (values.endDate) {
      baseDoc.isEndDateEnabled = true;
      baseDoc.endDate = values.endDate;
    } else {
      baseDoc.isEndDateEnabled = false;
    }

    if (values.appliesTo === 'category') {
      baseDoc.categories = values.productCategoryIds;
      baseDoc.categoriesExcluded = values.excludeCategoryIds;
      baseDoc.productsExcluded = values.excludeProductIds;
    }

    if (values.appliesTo === 'product') {
      baseDoc.products = values.appliesProductIds;
    }

    if (values.appliesTo === 'segment' && values.segmentId) {
      baseDoc.segments = [values.segmentId];
    }

    if (values.appliesTo === 'vendor') {
      baseDoc.vendors = values.vendorCompanyIds;
    }

    if (values.appliesTo === 'tag') {
      baseDoc.tags = values.productTagIds;
      baseDoc.tagsExcluded = values.excludeTagIds;
      baseDoc.productsExcluded = values.excludeProductIds;
    }

    if (values.appliesTo === 'bundle' && values.bundleProductIds.length) {
      baseDoc.productsBundle = [values.bundleProductIds];
    }

    try {
      await editPricing(baseDoc);
      form.reset(values);
      toast({
        title: 'Pricing updated',
        description: 'Changes have been saved successfully.',
      });
    } catch {
      toast({
        title: 'Failed to update pricing',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={GENERAL_FORM_ID}
          size="sm"
          disabled={loading || !pricingId}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, loading, onSaveActionChange, pricingId]);

  return (
    <div className="p-6">
      <Form {...form}>
        <form
          id={GENERAL_FORM_ID}
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <InfoCard title="General">
            <InfoCard.Content className="grid w-full grid-cols-2 gap-6">
              <div className="flex flex-col w-full space-y-4">
                <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
                  <Form.Field
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <Form.Item className="min-w-0">
                        <Form.Label>Name</Form.Label>
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
                      <Form.Item className="min-w-0">
                        <Form.Label>Status</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder="Select status" />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value="active">Active</Select.Item>
                              <Select.Item value="archived">
                                Archived
                              </Select.Item>
                              <Select.Item value="draft">Draft</Select.Item>
                              <Select.Item value="completed">
                                Completed
                              </Select.Item>
                            </Select.Content>
                          </Select>
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>

                <Form.Field
                  control={form.control}
                  name="isPriority"
                  render={({ field }) => (
                    <Form.Item className="min-w-0">
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

                <div className="grid w-full grid-cols-2 gap-4">
                  <GeneralDateField
                    control={form.control}
                    name="startDate"
                    label="Start date"
                    placeholder="Select start date"
                  />

                  <GeneralDateField
                    control={form.control}
                    name="endDate"
                    label="End date"
                    placeholder="Select end date"
                  />
                </div>
              </div>

              <div className="flex flex-col w-full space-y-4">
                <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
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
                            <Select.Trigger>
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
                              <Select.Item value="tag">
                                Specific Tag
                              </Select.Item>
                              <Select.Item value="bundle">
                                Specific Bundle
                              </Select.Item>
                            </Select.Content>
                          </Select>
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>

                {appliesTo === 'category' && (
                  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
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
                                field.onChange(normalizeMultipleValue(value))
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
                                field.onChange(normalizeMultipleValue(value))
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
                        <Form.Item className="lg:col-span-2">
                          <Form.Label>EXCLUDE PRODUCTS</Form.Label>
                          <Form.Control>
                            <SelectProduct
                              mode="multiple"
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(normalizeMultipleValue(value))
                              }
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                  </div>
                )}

                {appliesTo === 'product' && (
                  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
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
                                field.onChange(normalizeMultipleValue(value))
                              }
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                  </div>
                )}

                {appliesTo === 'segment' && (
                  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
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
                  </div>
                )}

                {appliesTo === 'vendor' && (
                  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
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
                                field.onChange(normalizeMultipleValue(value))
                              }
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                  </div>
                )}

                {appliesTo === 'tag' && (
                  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
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
                        <Form.Item className="lg:col-span-2">
                          <Form.Label>EXCLUDE PRODUCTS</Form.Label>
                          <Form.Control>
                            <SelectProduct
                              mode="multiple"
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(normalizeMultipleValue(value))
                              }
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                  </div>
                )}

                {appliesTo === 'bundle' && (
                  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
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
                                field.onChange(normalizeMultipleValue(value))
                              }
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                  </div>
                )}
              </div>
            </InfoCard.Content>
          </InfoCard>
        </form>
      </Form>
    </div>
  );
};

export default GeneralInfo;
