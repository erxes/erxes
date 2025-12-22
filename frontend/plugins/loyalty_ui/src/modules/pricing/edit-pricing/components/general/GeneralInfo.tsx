import { useEffect, useState } from 'react';
import { Input, Select, Button, InfoCard, Checkbox, Form } from 'erxes-ui';
import {
  SelectCompany,
  SelectSegment,
  SelectTags,
  SelectProduct,
} from 'ui-modules';
import { PricingDateSelect } from '@/pricing/components/PricingDateSelect';
import { IPricingPlanDetail } from '@/pricing/types';
import { useToast } from 'erxes-ui';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { useForm } from 'react-hook-form';
import {
  DISCOUNT_TYPES,
  DiscountType,
  PRICE_ADJUST_TYPES,
  PriceAdjustType,
} from '@/pricing/edit-pricing/components';
import { SelectCategory } from '@/pricing/components/SelectCategory';

interface GeneralInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}

interface GeneralFormValues {
  name: string;
  status: 'active' | 'archived' | 'draft' | 'completed';
  applyType: 'category' | 'product' | 'order';
  isPriority: boolean;
  discountType: DiscountType;
  startDate: string | null;
  endDate: string | null;
  discountValue: number;
  priceAdjustType: PriceAdjustType;
  priceAdjustFactor: number;
  bonusProductId: string | null;
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

export const GeneralInfo = ({ pricingId, pricingDetail }: GeneralInfoProps) => {
  const form = useForm<GeneralFormValues>({
    defaultValues: {
      name: '',
      status: 'active',
      applyType: 'product',
      isPriority: false,
      discountType: 'fixed',
      startDate: null,
      endDate: null,
      discountValue: 0,
      priceAdjustType: 'none',
      priceAdjustFactor: 0,
      bonusProductId: null,
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

  const discountType = form.watch('discountType');
  const appliesTo = form.watch('appliesTo');

  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
      discountType: (pricingDetail.type as DiscountType) || 'fixed',
      discountValue: pricingDetail.value ?? 0,
      priceAdjustType:
        (pricingDetail.priceAdjustType as PriceAdjustType) || 'none',
      priceAdjustFactor: pricingDetail.priceAdjustFactor ?? 0,
      bonusProductId: pricingDetail.bonusProduct || null,
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

    setHasChanges(false);
  }, [pricingDetail, form]);

  const handleSubmit = async (values: GeneralFormValues) => {
    if (!pricingId) return;

    // Map appliesTo to applyType
    const appliesToApplyTypeMap: Record<string, string> = {
      category: 'category',
      product: 'product',
      segment: 'segment',
      vendor: 'vendor',
      tag: 'tag',
      bundle: 'bundle',
    };

    const baseDoc: any = {
      _id: pricingId,
      name: values.name.trim(),
      status: values.status,
      applyType: appliesToApplyTypeMap[values.appliesTo] || values.applyType,
      isPriority: values.isPriority,
      type: values.discountType,
      value: values.discountValue,
      priceAdjustType: values.priceAdjustType,
      priceAdjustFactor: values.priceAdjustFactor,
    };

    if (values.discountType === 'bonus' && values.bonusProductId) {
      baseDoc.bonusProduct = values.bonusProductId;
    }

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

  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          <InfoCard title="General">
            <InfoCard.Content>
              {/* Name & Status */}
              <div className="grid grid-cols-2 gap-4">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Form.Item>
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
                    <Form.Item>
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
                            <Select.Item value="archived">Archived</Select.Item>
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

              {/* Discount Type & Priority */}
              <div className="grid grid-cols-2 gap-4">
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
                          <Select.Trigger>
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

                <Form.Field
                  control={form.control}
                  name="isPriority"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Priority</Form.Label>
                      <Form.Control>
                        <div className="h-9">
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
              </div>

              {/* Discount Value & Price Adjust (when not bonus) */}
              {discountType !== 'bonus' && (
                <div className="pr-2 space-y-4 w-1/2">
                  <Form.Field
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          Discount value{' '}
                          <span className="text-destructive">*</span>
                        </Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
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
                            <Select.Trigger>
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
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>
              )}

              {/* Bonus Product (when bonus) */}
              {discountType === 'bonus' && (
                <div className="pr-2 w-1/2">
                  <Form.Field
                    control={form.control}
                    name="bonusProductId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Bonus product</Form.Label>
                        <Form.Control>
                          <SelectProduct
                            value={field.value || ''}
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
                </div>
              )}

              {/* Start & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <Form.Field
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Start date</Form.Label>
                      <Form.Control>
                        <PricingDateSelect
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          placeholder="Select start date"
                          onValueChange={(value) => {
                            if (value) {
                              const year = value.getFullYear();
                              const month = String(
                                value.getMonth() + 1,
                              ).padStart(2, '0');
                              const day = String(value.getDate()).padStart(
                                2,
                                '0',
                              );
                              field.onChange(`${year}-${month}-${day}`);
                            } else {
                              field.onChange(null);
                            }
                          }}
                        />
                      </Form.Control>
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
                        <PricingDateSelect
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          placeholder="Select end date"
                          onValueChange={(value) => {
                            if (value) {
                              const year = value.getFullYear();
                              const month = String(
                                value.getMonth() + 1,
                              ).padStart(2, '0');
                              const day = String(value.getDate()).padStart(
                                2,
                                '0',
                              );
                              field.onChange(`${year}-${month}-${day}`);
                            } else {
                              field.onChange(null);
                            }
                          }}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
              </div>

              {/* Applies To */}
              <div className="pr-2 w-1/2">
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
              </div>

              {/* Category Fields */}
              {appliesTo === 'category' && (
                <div className="pr-2 space-y-4 w-1/2">
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

              {/* Product Fields */}
              {appliesTo === 'product' && (
                <div className="pr-2 w-1/2">
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
                </div>
              )}

              {/* Segment Fields */}
              {appliesTo === 'segment' && (
                <div className="pr-2 w-1/2">
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

              {/* Vendor Fields */}
              {appliesTo === 'vendor' && (
                <div className="pr-2 w-1/2">
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
                </div>
              )}

              {/* Tag Fields */}
              {appliesTo === 'tag' && (
                <div className="pr-2 space-y-4 w-1/2">
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

              {/* Bundle Fields */}
              {appliesTo === 'bundle' && (
                <div className="pr-2 space-y-4 w-1/2">
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
                </div>
              )}

              {/* Submit Button */}
              {hasChanges && (
                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={loading}>
                    Save Changes
                  </Button>
                </div>
              )}
            </InfoCard.Content>
          </InfoCard>
        </form>
      </Form>
    </div>
  );
};

export default GeneralInfo;
