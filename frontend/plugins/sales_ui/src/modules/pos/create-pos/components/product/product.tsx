import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import {
  Form,
  Button,
  Input,
  Dialog,
  Label,
  Skeleton,
  Checkbox,
} from 'erxes-ui';
import { IconPlus, IconTrash, IconX, IconEdit } from '@tabler/icons-react';
import type { ProductFormValues } from '../formSchema';
import { IPosDetail } from '@/pos/pos-detail/types/IPos';
import { SelectCategory, SelectProduct } from 'ui-modules';
import { useMultiSelectToggle } from '../../hooks/useMultiSelector';
import { useProductGroups } from '@/pos/hooks/useProductGroups';
import { ProductGroup } from '~/modules/pos/create-pos/types';

interface ProductFormProps {
  form?: UseFormReturn<ProductFormValues>;
  posDetail?: IPosDetail;
  isReadOnly?: boolean;
  onSubmit?: (data: ProductFormValues) => Promise<void>;
  productGroups?: ProductGroup[];
}

export default function ProductForm({
  form: externalForm,
  posDetail,
  isReadOnly = false,
  onSubmit,
  productGroups,
}: ProductFormProps) {
  const [, setIsSubmitting] = useState(false);
  const [openAddProductDialog, setOpenAddProductDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newGroup, setNewGroup] = useState<ProductGroup>({
    name: '',
    description: '',
    categoryIds: [],
    excludedCategoryIds: [],
    excludedProductIds: [],
  });

  const internalForm = useForm<ProductFormValues>({
    defaultValues: {
      productDetails: [],
      catProdMappings: [],
      initialCategoryIds: [],
      kioskExcludeCategoryIds: [],
      kioskExcludeProductIds: [],
      checkExcludeCategoryIds: [],
      productGroups: [],
      isCheckRemainder: false,
      banFractions: false,
    },
  });

  const form = externalForm || internalForm;
  const toggleMultiSelect = useMultiSelectToggle(form);
  const { productGroups: fetchedProductGroups, loading: productGroupsLoading } =
    useProductGroups(posDetail?._id);

  useEffect(() => {
    if (!posDetail) return;

    const productDetailsAsStrings = (posDetail.productDetails || []).map(
      (detail) => (typeof detail === 'string' ? detail : detail.productId),
    );

    form.reset({
      productDetails: productDetailsAsStrings,
      catProdMappings: posDetail.catProdMappings || [],
      initialCategoryIds: posDetail.initialCategoryIds || [],
      kioskExcludeCategoryIds: posDetail.kioskExcludeCategoryIds || [],
      kioskExcludeProductIds: posDetail.kioskExcludeProductIds || [],
      checkExcludeCategoryIds: posDetail.checkExcludeCategoryIds || [],
      productGroups: fetchedProductGroups || [],
      isCheckRemainder: posDetail.isCheckRemainder || false,
      banFractions: posDetail.banFractions || false,
    });
  }, [posDetail, form, fetchedProductGroups]);

  const addItem = (fieldName: keyof ProductFormValues, newItem: any) => {
    if (isReadOnly) return;
    const current = form.getValues(fieldName as any);
    const nextArray = Array.isArray(current) ? current : [];
    form.setValue(fieldName, [...nextArray, newItem] as any);
  };

  const removeItem = (fieldName: keyof ProductFormValues, index: number) => {
    if (isReadOnly) return;
    const current = form.watch(fieldName) || [];
    if (Array.isArray(current)) {
      form.setValue(fieldName, current.filter((_, i) => i !== index) as any);
    }
  };

  const handleSubmit = async (data: ProductFormValues) => {
    if (isReadOnly || !onSubmit) return;
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="p-3">
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold uppercase text-primary">
              Product Groups
            </h2>

            {!isReadOnly && (
              <Button
                type="button"
                variant="default"
                onClick={() => setOpenAddProductDialog(true)}
                className="flex gap-2 items-center"
              >
                <IconPlus size={16} />
                Add Group
              </Button>
            )}

            <div className="space-y-4">
              {productGroupsLoading ? (
                <>
                  {[1].map((i) => (
                    <Skeleton key={i} className="w-full h-8 rounded-lg" />
                  ))}
                </>
              ) : (
                form.watch('productGroups')?.map((group, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 rounded-lg border bg-background"
                  >
                    <h3 className="text-base font-semibold">{group.name}</h3>
                    {!isReadOnly && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingIndex(index);
                            setNewGroup(group);
                            setOpenAddProductDialog(true);
                          }}
                        >
                          <IconEdit size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem('productGroups', index)}
                          className="text-destructive"
                        >
                          <IconTrash size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold uppercase text-primary">
              HOME Screen PRODUCT CATEGORIES
            </h2>

            <Form.Field
              control={form.control}
              name="initialCategoryIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-sm uppercase">
                    INITIAL CATEGORY IDS
                  </Form.Label>
                  <Form.Control>
                    <div className="space-y-2">
                      <SelectCategory
                        selected={field.value?.[0]}
                        onSelect={(categoryId) =>
                          toggleMultiSelect(
                            'initialCategoryIds',
                            categoryId as string,
                          )
                        }
                        disabled={isReadOnly}
                        className="justify-between px-3 w-full text-left"
                      />
                    </div>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold uppercase text-primary">
              KIOSK EXCLUDE PRODUCTS
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="kioskExcludeCategoryIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-sm uppercase">
                      EXCLUDE CATEGORIES
                    </Form.Label>
                    <Form.Control>
                      <div className="space-y-2">
                        <SelectCategory
                          selected={field.value?.[0]}
                          onSelect={(categoryId) =>
                            toggleMultiSelect(
                              'kioskExcludeCategoryIds',
                              categoryId as string,
                            )
                          }
                          disabled={isReadOnly}
                          className="justify-between px-3 w-full text-left"
                        />
                      </div>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="kioskExcludeProductIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-sm uppercase">
                      EXCLUDE PRODUCTS
                    </Form.Label>
                    <Form.Control>
                      <div className="space-y-2">
                        <SelectProduct
                          value={field.value?.[0]}
                          onValueChange={(productId) =>
                            toggleMultiSelect(
                              'kioskExcludeProductIds',
                              productId as string,
                            )
                          }
                          disabled={isReadOnly}
                          className="justify-between px-3 w-full text-left"
                        />
                      </div>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold uppercase text-primary">
              PRODUCT & CATEGORY MAPPING
            </h2>

            <p className="text-sm text-muted-foreground">
              Map products to categories. When a product within that category is
              sold with take option, the mapped product will be added to the
              price.
            </p>

            {!isReadOnly && (
              <Button
                type="button"
                onClick={() => {
                  const currentMappings =
                    form.getValues('catProdMappings') || [];
                  const newMapping = {
                    _id: `temp-${Math.random().toString(36).slice(2, 11)}`,
                    categoryId: '',
                    productId: '',
                    name: '',
                    code: '',
                  };
                  form.setValue('catProdMappings', [
                    ...currentMappings,
                    newMapping,
                  ]);
                }}
                className="flex gap-2 items-center"
                variant="default"
              >
                <IconPlus size={16} />
                Add Mapping
              </Button>
            )}

            {form.watch('catProdMappings')?.length > 0 && (
              <div className="space-y-4">
                {form.watch('catProdMappings')?.map((mapping, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <Form.Field
                      control={form.control}
                      name={`catProdMappings.${index}.categoryId`}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label className="text-sm uppercase">
                            CATEGORY
                          </Form.Label>
                          <Form.Control>
                            <SelectCategory
                              selected={field.value}
                              onSelect={(value) => field.onChange(value)}
                              disabled={isReadOnly}
                              className="h-8"
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    <Form.Field
                      control={form.control}
                      name={`catProdMappings.${index}.productId`}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label className="text-sm uppercase">
                            PRODUCTS
                          </Form.Label>
                          <Form.Control>
                            <div className="space-y-2">
                              <SelectProduct
                                value={field.value}
                                onValueChange={(productId) => {
                                  field.onChange(productId);
                                }}
                                disabled={isReadOnly}
                                className="w-full h-8"
                              />
                            </div>
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name={`catProdMappings.${index}.name`}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label className="text-sm uppercase">
                            Product Name Contains
                          </Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder="Write here"
                              className="h-8"
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name={`catProdMappings.${index}.code`}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label className="text-sm uppercase">
                            Product Code Contains
                          </Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder="Write here"
                              className="h-8"
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    {!isReadOnly && (
                      <div className="flex col-span-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem('catProdMappings', index)}
                          className="text-destructive"
                        >
                          <IconTrash size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold uppercase text-primary">
              CHECK EXCLUDE CATEGORIES
            </h2>

            <Form.Field
              control={form.control}
              name="checkExcludeCategoryIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-sm uppercase">
                    EXCLUDE CATEGORIES
                  </Form.Label>
                  <Form.Control>
                    <div className="space-y-2">
                      <SelectCategory
                        selected={field.value?.[0]}
                        onSelect={(categoryId) =>
                          toggleMultiSelect(
                            'checkExcludeCategoryIds',
                            categoryId as string,
                          )
                        }
                        disabled={isReadOnly}
                        className="justify-between px-3 w-full text-left"
                      />
                    </div>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="grid grid-cols-2 gap-4 items-center">
              <Form.Field
                control={form.control}
                name="isCheckRemainder"
                render={({ field }) => (
                  <Form.Item className="flex gap-2 items-center">
                    <Form.Control>
                      <Checkbox
                        id="isCheckRemainder"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isReadOnly}
                        className="mt-2"
                      />
                    </Form.Control>
                    <Label
                      htmlFor="isCheckRemainder"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Check Remainder
                    </Label>
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="banFractions"
                render={({ field }) => (
                  <Form.Item className="flex gap-2 items-center">
                    <Form.Control>
                      <Checkbox
                        id="banFractions"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isReadOnly}
                        className="mt-2"
                      />
                    </Form.Control>
                    <Label
                      htmlFor="banFractions"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Ban Fractions
                    </Label>
                  </Form.Item>
                )}
              />
            </div>
          </section>
        </div>
      </form>

      <Dialog
        open={openAddProductDialog}
        onOpenChange={setOpenAddProductDialog}
      >
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header className="pb-4 border-b">
            <div className="flex justify-between items-center">
              <Dialog.Title className="text-lg font-bold">
                {editingIndex === null ? 'Add group' : 'Edit group'}
              </Dialog.Title>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenAddProductDialog(false)}
                className="p-0 w-8 h-8"
              >
                <IconX size={20} />
              </Button>
            </div>
          </Dialog.Header>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold uppercase">
                GROUP NAME <span className="text-destructive">*</span>
              </Label>

              <Input
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
                placeholder="Enter group name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold uppercase">
                GROUP DESCRIPTION
              </Label>
              <Input
                value={newGroup.description}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, description: e.target.value })
                }
                placeholder="Enter group description"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold uppercase">
                PRODUCT CATEGORY
              </Label>
              <SelectCategory
                selected={newGroup.categoryIds?.[0]}
                onSelect={(categoryId) => {
                  const currentIds = newGroup.categoryIds || [];
                  const newIds = currentIds.includes(categoryId as string)
                    ? currentIds.filter((id) => id !== categoryId)
                    : [...currentIds, categoryId as string];
                  setNewGroup({ ...newGroup, categoryIds: newIds });
                }}
                className="justify-between px-3 w-full text-left"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold uppercase">
                EXCLUDE PRODUCT CATEGORY
              </Label>
              <SelectCategory
                selected={newGroup.excludedCategoryIds?.[0]}
                onSelect={(categoryId) => {
                  const currentIds = newGroup.excludedCategoryIds || [];
                  const newIds = currentIds.includes(categoryId as string)
                    ? currentIds.filter((id) => id !== categoryId)
                    : [...currentIds, categoryId as string];
                  setNewGroup({ ...newGroup, excludedCategoryIds: newIds });
                }}
                className="justify-between px-3 w-full text-left"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold uppercase">
                EXCLUDE PRODUCTS
              </Label>
              <SelectProduct
                value={newGroup.excludedProductIds?.[0]}
                onValueChange={(value) => {
                  const productId = Array.isArray(value) ? value[0] : value;
                  const currentIds = newGroup.excludedProductIds || [];
                  const newIds = currentIds.includes(productId)
                    ? currentIds.filter((id) => id !== productId)
                    : [...currentIds, productId];
                  setNewGroup({ ...newGroup, excludedProductIds: newIds });
                }}
                className="w-full"
              />
            </div>
          </div>

          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={() => {
                setOpenAddProductDialog(false);
                setEditingIndex(null);
                setNewGroup({
                  name: '',
                  description: '',
                  categoryIds: [],
                  excludedCategoryIds: [],
                  excludedProductIds: [],
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newGroup.name) return;
                if (editingIndex === null) {
                  function randomId(length = 12) {
                    return [...new Array(length)]
                      .map(() => Math.random().toString(36)[2])
                      .join('');
                  }

                  const groupWithId = {
                    ...newGroup,
                    _id: `temporaryId-${randomId()}`,
                  };
                  addItem('productGroups', groupWithId);
                } else {
                  const currentGroups = form.watch('productGroups') || [];
                  const updatedGroups = [...currentGroups];
                  updatedGroups[editingIndex] = newGroup;
                  form.setValue('productGroups', updatedGroups);
                }
                setOpenAddProductDialog(false);
                setEditingIndex(null);
                setNewGroup({
                  name: '',
                  description: '',
                  categoryIds: [],
                  excludedCategoryIds: [],
                  excludedProductIds: [],
                });
              }}
              disabled={newGroup.name === ''}
              variant="default"
            >
              {editingIndex === null ? 'Add to POS' : 'Update'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </Form>
  );
}
