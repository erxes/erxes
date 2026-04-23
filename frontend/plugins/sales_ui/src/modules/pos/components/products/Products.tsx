import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, Label, toast } from 'erxes-ui';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { ProductGroupsList } from '@/pos/components/products/ProductGroupsList';
import { InitialProductCategories } from '@/pos/components/products/InitialProductCategories';
import { KioskExcludeProducts } from '@/pos/components/products/KioskExcludeProducts';
import { ProductAndCategoryMapping } from '@/pos/components/products/ProductAndCategoryMapping';
import { RemainderConfigs } from '@/pos/components/products/RemainderConfigs';
import { ServiceCharge } from '@/pos/components/products/ServiceCharge';
import { isFieldVisible } from '@/pos/constants';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { type CatProd } from '@/pos/pos-detail/types/IPos';

interface ProductsProps {
  posId?: string;
  posType?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

interface ProductGroupSaveState {
  isDirty: boolean;
  saving: boolean;
  onSave: () => Promise<void>;
}

export interface ProductsFormData {
  initialCategoryIds: string[];
  kioskExcludeCategoryIds: string[];
  kioskExcludeProductIds: string[];
  catProdMappings: CatProd[];
  isCheckRemainder: boolean;
  checkExcludeCategoryIds: string[];
  banFractions: boolean;
  serviceCharge: string;
  serviceChargeApplicableProductId: string;
}

const PRODUCTS_FORM_ID = 'pos-products-form';

const DEFAULT_FORM_VALUES: ProductsFormData = {
  initialCategoryIds: [],
  kioskExcludeCategoryIds: [],
  kioskExcludeProductIds: [],
  catProdMappings: [],
  isCheckRemainder: false,
  checkExcludeCategoryIds: [],
  banFractions: false,
  serviceCharge: '',
  serviceChargeApplicableProductId: '',
};

const MoreOptionsButton = ({
  showMore,
  onToggle,
}: {
  showMore: boolean;
  onToggle: () => void;
}) => (
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={onToggle}
    className="flex gap-1 items-center text-muted-foreground"
  >
    {showMore ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
    {showMore ? 'Hide more options' : 'More options'}
  </Button>
);

const sanitizeMappings = (mappings: CatProd[]) =>
  mappings.map((mapping) => {
    return {
      _id: mapping._id,
      categoryId: mapping.categoryId,
      code: mapping.code || '',
      name: mapping.name || '',
      productId: mapping.productId,
    };
  });

const parseServiceCharge = (value: string): number | undefined => {
  if (value === '') {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const Products: React.FC<ProductsProps> = ({
  posId,
  posType,
  onSaveActionChange,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [productGroupSaveState, setProductGroupSaveState] =
    useState<ProductGroupSaveState | null>(null);
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const form = useForm<ProductsFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { control, handleSubmit, reset, setValue, watch, formState } = form;
  const { isDirty } = formState;

  const isRestaurant = posType === 'restaurant';
  const canEditProductGroups = isFieldVisible('productGroups', posType);
  const canEditInitialCategories = isFieldVisible(
    'initialProductCategories',
    posType,
  );
  const canEditKioskExcludes = isFieldVisible('kioskExcludeProducts', posType);
  const canEditCategoryMapping = isFieldVisible(
    'productCategoryMapping',
    posType,
  );
  const canEditRemainderConfigs = isFieldVisible('remainderConfigs', posType);
  const canEditServiceCharge = isFieldVisible('serviceCharge', posType);
  const hasMoreOptions =
    isRestaurant &&
    (canEditKioskExcludes ||
      canEditCategoryMapping ||
      canEditRemainderConfigs ||
      canEditServiceCharge);

  const catProdMappings = watch('catProdMappings');
  const toggleMore = useCallback(() => setShowMore((prev) => !prev), []);
  const hasChanges = isDirty || !!productGroupSaveState?.isDirty;
  const isSaving = saving || !!productGroupSaveState?.saving;

  useEffect(() => {
    if (!posDetail) {
      return;
    }

    reset({
      initialCategoryIds: posDetail.initialCategoryIds || [],
      kioskExcludeCategoryIds: posDetail.kioskExcludeCategoryIds || [],
      kioskExcludeProductIds: posDetail.kioskExcludeProductIds || [],
      catProdMappings: posDetail.catProdMappings || [],
      isCheckRemainder: posDetail.isCheckRemainder || false,
      checkExcludeCategoryIds: posDetail.checkExcludeCategoryIds || [],
      banFractions: posDetail.banFractions || false,
      serviceCharge:
        posDetail.serviceCharge === undefined ||
        posDetail.serviceCharge === null
          ? ''
          : String(posDetail.serviceCharge),
      serviceChargeApplicableProductId:
        posDetail.serviceChargeApplicableProductId || '',
    });
  }, [posDetail, reset]);

  const handleMappingAdded = (mapping: CatProd) => {
    setValue('catProdMappings', [...catProdMappings, mapping], {
      shouldDirty: true,
    });
  };

  const handleMappingUpdated = (updatedMapping: CatProd) => {
    setValue(
      'catProdMappings',
      catProdMappings.map((mapping) =>
        mapping._id === updatedMapping._id ? updatedMapping : mapping,
      ),
      { shouldDirty: true },
    );
  };

  const handleMappingDeleted = (mappingId: string) => {
    setValue(
      'catProdMappings',
      catProdMappings.filter((mapping) => mapping._id !== mappingId),
      { shouldDirty: true },
    );
  };

  const handleSaveChanges = useCallback(
    async (data: ProductsFormData) => {
      if (!posId) {
        toast({
          title: 'Error',
          description: 'POS ID is required',
          variant: 'destructive',
        });
        return;
      }

      if (canEditInitialCategories && !data.initialCategoryIds.length) {
        toast({
          title: 'Error',
          description: 'Please select categories',
          variant: 'destructive',
        });
        return;
      }

      try {
        await posEdit({
          variables: {
            _id: posId,
            ...(canEditInitialCategories
              ? { initialCategoryIds: data.initialCategoryIds }
              : {}),
            ...(canEditKioskExcludes
              ? {
                  kioskExcludeCategoryIds: data.kioskExcludeCategoryIds,
                  kioskExcludeProductIds: data.kioskExcludeProductIds,
                }
              : {}),
            ...(canEditCategoryMapping
              ? { catProdMappings: sanitizeMappings(data.catProdMappings) }
              : {}),
            ...(canEditRemainderConfigs
              ? {
                  isCheckRemainder: data.isCheckRemainder,
                  checkExcludeCategoryIds: data.checkExcludeCategoryIds,
                  banFractions: data.banFractions,
                }
              : {}),
            ...(canEditServiceCharge
              ? {
                  serviceCharge: parseServiceCharge(data.serviceCharge),
                  serviceChargeApplicableProductId:
                    data.serviceChargeApplicableProductId || null,
                }
              : {}),
          },
          refetchQueries: canEditServiceCharge ? ['posDetail'] : undefined,
        });

        toast({
          title: 'Success',
          description: 'Product settings saved successfully',
        });
        reset(data);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to save product settings',
          variant: 'destructive',
        });
      }
    },
    [
      canEditCategoryMapping,
      canEditInitialCategories,
      canEditKioskExcludes,
      canEditRemainderConfigs,
      canEditServiceCharge,
      posEdit,
      posId,
      reset,
    ],
  );

  const handleHeaderSaveChanges = useCallback(async () => {
    if (productGroupSaveState?.isDirty) {
      await productGroupSaveState.onSave();
    }

    if (isDirty) {
      await handleSubmit(handleSaveChanges)();
    }
  }, [handleSaveChanges, handleSubmit, isDirty, productGroupSaveState]);

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      hasChanges ? (
        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={handleHeaderSaveChanges}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [handleHeaderSaveChanges, hasChanges, isSaving, onSaveActionChange]);

  const renderProductSettings = () => {
    if (detailLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <div className="w-24 h-4 rounded animate-pulse bg-muted" />
              <div className="h-8 rounded animate-pulse bg-muted" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center">
          <p className="text-destructive">
            Failed to load POS details: {error.message}
          </p>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form
          id={PRODUCTS_FORM_ID}
          onSubmit={handleSubmit(handleSaveChanges)}
          className="space-y-8"
        >
          {canEditInitialCategories && (
            <section className="space-y-4">
              <Label>Initial product categories</Label>
              <InitialProductCategories control={control} />
            </section>
          )}

          <div className="flex justify-center">
            {hasMoreOptions && (
              <MoreOptionsButton showMore={showMore} onToggle={toggleMore} />
            )}
          </div>

          {(!isRestaurant || showMore) && (
            <>
              {canEditKioskExcludes && (
                <section className="pt-6 space-y-4 border-t">
                  <Label>Kiosk exclude products</Label>
                  <KioskExcludeProducts control={control} />
                </section>
              )}

              {canEditCategoryMapping && (
                <section className="pt-6 space-y-4 border-t">
                  <Label>Product & category mapping</Label>
                  <ProductAndCategoryMapping
                    mappings={catProdMappings}
                    onMappingAdded={handleMappingAdded}
                    onMappingUpdated={handleMappingUpdated}
                    onMappingDeleted={handleMappingDeleted}
                  />
                </section>
              )}

              {canEditRemainderConfigs && (
                <section className="pt-6 space-y-4 border-t">
                  <Label>Remainder configs</Label>
                  <RemainderConfigs control={control} />
                </section>
              )}

              {canEditServiceCharge && (
                <section className="pt-6 space-y-4 border-t">
                  <Label>Service charge</Label>
                  <ServiceCharge control={control} />
                </section>
              )}
            </>
          )}
        </form>
      </Form>
    );
  };

  return (
    <div className="p-6">
      <InfoCard title="Product configuration">
        <InfoCard.Content>
          <div className="space-y-8">
            {canEditProductGroups && (
              <section className="space-y-4">
                <Label>Product Groups</Label>
                <ProductGroupsList
                  posId={posId}
                  onSaveStateChange={setProductGroupSaveState}
                />
              </section>
            )}

            {renderProductSettings()}
          </div>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default Products;
