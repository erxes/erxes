import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, Label, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { ProductGroupsList } from '@/pos/components/products/ProductGroupsList';
import { InitialProductCategories } from '@/pos/components/products/InitialProductCategories';
import { KioskExcludeProducts } from '@/pos/components/products/KioskExcludeProducts';
import { ProductAndCategoryMapping } from '@/pos/components/products/ProductAndCategoryMapping';
import { RemainderConfigs } from '@/pos/components/products/RemainderConfigs';
import { ServiceCharge } from '@/pos/components/products/ServiceCharge';
import { MoreOptionsButton } from '@/pos/components/MoreOptionsButton';
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
  saveRemainder: boolean;
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
  saveRemainder: false,
  banFractions: false,
  serviceCharge: '',
  serviceChargeApplicableProductId: '',
};

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
  const { t } = useTranslation('sales');
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
      saveRemainder: posDetail.saveRemainder || false,
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
          title: t('error'),
          description: t('pos-id-required'),
          variant: 'destructive',
        });
        return;
      }

      try {
        await posEdit({
          variables: {
            _id: posId,
            initialCategoryIds: data.initialCategoryIds,

            kioskExcludeCategoryIds: data.kioskExcludeCategoryIds,
            kioskExcludeProductIds: data.kioskExcludeProductIds,

            catProdMappings: sanitizeMappings(data.catProdMappings),

            isCheckRemainder: data.isCheckRemainder,
            checkExcludeCategoryIds: data.checkExcludeCategoryIds,
            saveRemainder: data.saveRemainder,
            banFractions: data.banFractions,


            serviceCharge: parseServiceCharge(data.serviceCharge),
            serviceChargeApplicableProductId:
              data.serviceChargeApplicableProductId || null,
          },
          refetchQueries: ['posDetail'],
        });

        toast({
          title: t('success'),
          description: t('product-settings-saved'),
        });
        reset(data);
      } catch {
        toast({
          title: t('error'),
          description: t('product-settings-save-failed'),
          variant: 'destructive',
        });
      }
    },
    [
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
          {isSaving ? t('saving') : t('save-changes')}
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
            {t('failed-to-load-pos-details')}: {error.message}
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
          <section className="space-y-4">
            <Label>{t('initial-product-categories')}</Label>
            <InitialProductCategories control={control} />
          </section>

          <div className="flex justify-center">
            <MoreOptionsButton showMore={showMore} onToggle={toggleMore} />
          </div>

          {(!isRestaurant || showMore) && (
            <>
              <section className="pt-6 space-y-4 border-t">
                <Label>{t('kiosk-exclude-products')}</Label>
                <KioskExcludeProducts control={control} />
              </section>

              <section className="pt-6 space-y-4 border-t">
                <Label>{t('product-category-mapping')}</Label>
                <ProductAndCategoryMapping
                  mappings={catProdMappings}
                  onMappingAdded={handleMappingAdded}
                  onMappingUpdated={handleMappingUpdated}
                  onMappingDeleted={handleMappingDeleted}
                />
              </section>

              <section className="pt-6 space-y-4 border-t">
                <Label>{t('remainder-configs')}</Label>
                <RemainderConfigs control={control} />
              </section>

              <section className="pt-6 space-y-4 border-t">
                <Label>{t('service-charge')}</Label>
                <ServiceCharge control={control} />
              </section>
            </>
          )}
        </form>
      </Form>
    );
  };

  return (
    <div className="p-6">
      <InfoCard title={t('product-config')}>
        <InfoCard.Content>
          <div className="space-y-8">
            <section className="space-y-4">
              <Label>{t('product-groups')}</Label>
              <ProductGroupsList
                posId={posId}
                onSaveStateChange={setProductGroupSaveState}
              />
            </section>
            {renderProductSettings()}
          </div>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default Products;
