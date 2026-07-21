import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { IPricingPlanDetail } from '@/pricing/types';
import {
  PRICING_PRIORITY_OPTIONS,
  PricingPriorityFormValue,
  priorityFromFormValue,
  priorityToFormValue,
} from '@/pricing/constants';
import {
  formatDateValue,
  isDateRangeValid,
  parseDateValue,
} from '@/pricing/utils/date';
import {
  Button,
  DatePicker,
  Form,
  InfoCard,
  Input,
  Select,
  useToast,
} from 'erxes-ui';
import { useEffect, type ReactNode } from 'react';
import { useForm, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  SelectCompany,
  SelectCategory,
  SelectProduct,
  SelectSegment,
  SelectTags,
} from 'ui-modules';

interface GeneralInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

interface GeneralFormValues {
  name: string;
  status: 'active' | 'archived' | 'draft' | 'completed';
  applyType: 'category' | 'product' | 'order';
  priority: PricingPriorityFormValue;
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
  const { t } = useTranslation('loyalty');
  const form = useForm<GeneralFormValues>({
    defaultValues: {
      name: '',
      status: 'active',
      applyType: 'product',
      priority: 'none',
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
      priority: priorityToFormValue(pricingDetail.priority),
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
        message: t('end-date-after-start', 'End date must be after start date.'),
      });
      toast({
        title: t('invalid-date-range', 'Invalid date range'),
        description: t('end-date-after-start', 'End date must be after start date.'),
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
      priority: priorityFromFormValue(values.priority),
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
        title: t('pricing-updated', 'Pricing updated'),
        description: t('changes-saved', 'Changes have been saved successfully.'),
      });
    } catch {
      toast({
        title: t('failed-to-update-pricing', 'Failed to update pricing'),
        description: t('unexpected-error', 'An unexpected error occurred.'),
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
          {loading ? t('saving', 'Saving...') : t('save-changes', 'Save Changes')}
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
          <InfoCard title={t('general', 'General')}>
            <InfoCard.Content className="grid w-full grid-cols-2 gap-6">
              <div className="flex flex-col w-full space-y-4">
                <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
                  <Form.Field
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <Form.Item className="min-w-0">
                        <Form.Label>{t('name', 'Name')}</Form.Label>
                        <Form.Control>
                          <Input
                            placeholder={t('enter-pricing-name', 'Enter pricing name')}
                            {...field}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Form.Item className="min-w-0">
                        <Form.Label>{t('status', 'Status')}</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder={t('select-status', 'Select status')} />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value="active">
                                {t('active', 'Active')}
                              </Select.Item>
                              <Select.Item value="archived">
                                {t('archived', 'Archived')}
                              </Select.Item>
                              <Select.Item value="draft">
                                {t('draft', 'Draft')}
                              </Select.Item>
                              <Select.Item value="completed">
                                {t('completed', 'Completed')}
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
                  name="priority"
                  render={({ field }) => (
                    <Form.Item className="min-w-0">
                      <Form.Label>{t('priority', 'Priority')}</Form.Label>
                      <Form.Control>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <Select.Trigger>
                            <Select.Value placeholder={t('select-priority')} />
                          </Select.Trigger>
                          <Select.Content>
                            {PRICING_PRIORITY_OPTIONS.map((option) => (
                              <Select.Item
                                key={option.label}
                                value={option.value}
                              >
                                {t(option.label)}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </Form.Control>
                    </Form.Item>
                  )}
                />

                <div className="grid w-full grid-cols-2 gap-4">
                  <GeneralDateField
                    control={form.control}
                    name="startDate"
                    label={t('start-date', 'Start Date')}
                    placeholder={t('select-start-date', 'Select start date')}
                  />

                  <GeneralDateField
                    control={form.control}
                    name="endDate"
                    label={t('end-date', 'End Date')}
                    placeholder={t('select-end-date', 'Select end date')}
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
                        <Form.Label>{t('applies-to', 'APPLIES TO')}</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder={t('select-target', 'Select target')} />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value="category">
                                {t('specific-category', 'Specific Category')}
                              </Select.Item>
                              <Select.Item value="product">
                                {t('specific-product', 'Specific Product')}
                              </Select.Item>
                              <Select.Item value="segment">
                                {t('specific-segment', 'Specific Segment')}
                              </Select.Item>
                              <Select.Item value="vendor">
                                {t('specific-vendor', 'Specific Vendor')}
                              </Select.Item>
                              <Select.Item value="tag">
                                {t('specific-tag', 'Specific Tag')}
                              </Select.Item>
                              <Select.Item value="bundle">
                                {t('specific-bundle', 'Specific Bundle')}
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
                          <Form.Label>
                            {t('product-categories-label', 'PRODUCT CATEGORIES')}
                          </Form.Label>
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
                          <Form.Label>{t('exclude-categories', 'EXCLUDE CATEGORIES')}</Form.Label>
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
                          <Form.Label>{t('exclude-products', 'EXCLUDE PRODUCTS')}</Form.Label>
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
                          <Form.Label>{t('products-label', 'PRODUCTS')}</Form.Label>
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
                          <Form.Label>{t('segment-label', 'SEGMENT')}</Form.Label>
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
                          <Form.Label>{t('vendors', 'VENDORS')}</Form.Label>
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
                          <Form.Label>{t('product-tags', 'PRODUCT TAGS')}</Form.Label>
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
                          <Form.Label>{t('exclude-tags', 'EXCLUDE TAGS')}</Form.Label>
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
                          <Form.Label>{t('exclude-products', 'EXCLUDE PRODUCTS')}</Form.Label>
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
                          <Form.Label>{t('products-to-bundle', 'PRODUCTS TO BUNDLE')}</Form.Label>
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
