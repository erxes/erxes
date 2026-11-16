import { PosSaveAction } from '@/pos/components/pos-edit/PosSaveAction';
import { PosSettingsSection } from '@/pos/components/pos-edit/PosSettingsSection';
import { InitialProductCategories } from '@/pos/components/products/InitialProductCategories';
import { KioskExcludeProducts } from '@/pos/components/products/KioskExcludeProducts';
import { ProductAndCategoryMapping } from '@/pos/components/products/ProductAndCategoryMapping';
import { toCatProdMappings } from '@/pos/components/products/catProdMappings';
import { ProductGroupsList } from '@/pos/components/products/ProductGroupsList';
import { RemainderConfigs } from '@/pos/components/products/RemainderConfigs';
import { ServiceCharge } from '@/pos/components/products/ServiceCharge';
import { mutations } from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { useMutation } from '@apollo/client';
import { Form, isDefined, toast } from 'erxes-ui';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface ProductsProps {
  posId?: string;
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
  isShowRemainder: boolean;
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
  isShowRemainder: false,
  isCheckRemainder: false,
  checkExcludeCategoryIds: [],
  saveRemainder: false,
  banFractions: false,
  serviceCharge: '',
  serviceChargeApplicableProductId: '',
};

const parseServiceCharge = (value: string): number | undefined => {
  if (value === '') {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const Products: React.FC<ProductsProps> = ({ posId, onSaveActionChange }) => {
  const { t } = useTranslation('sales');
  const [productGroupSaveState, setProductGroupSaveState] =
    useState<ProductGroupSaveState | null>(null);
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const form = useForm<ProductsFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { control, handleSubmit, reset, formState } = form;
  const { isDirty } = formState;

  const catProdMappings = useMemo(
    () => toCatProdMappings(posDetail?.catProdMappings),
    [posDetail?.catProdMappings],
  );
  const hasChanges = isDirty || !!productGroupSaveState?.isDirty;
  const isSaving = saving || !!productGroupSaveState?.saving;

  useEffect(() => {
    if (!posDetail) {
      return;
    }

    reset(
      {
        initialCategoryIds: (posDetail.initialCategoryIds ?? []).filter(
          isDefined,
        ),
        kioskExcludeCategoryIds: (
          posDetail.kioskExcludeCategoryIds ?? []
        ).filter(isDefined),
        kioskExcludeProductIds: (posDetail.kioskExcludeProductIds ?? []).filter(
          isDefined,
        ),
        isShowRemainder: posDetail.isShowRemainder || false,
        isCheckRemainder: posDetail.isCheckRemainder || false,
        checkExcludeCategoryIds: (
          posDetail.checkExcludeCategoryIds ?? []
        ).filter(isDefined),
        saveRemainder: posDetail.saveRemainder || false,
        banFractions: posDetail.banFractions || false,
        serviceCharge:
          posDetail.serviceCharge === undefined ||
          posDetail.serviceCharge === null
            ? ''
            : String(posDetail.serviceCharge),
        serviceChargeApplicableProductId:
          posDetail.serviceChargeApplicableProductId || '',
      },
      { keepDirtyValues: true },
    );
  }, [posDetail, reset]);

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

            isShowRemainder: data.isShowRemainder,
            isCheckRemainder: data.isCheckRemainder,
            checkExcludeCategoryIds: data.checkExcludeCategoryIds,
            saveRemainder: data.saveRemainder,
            banFractions: data.banFractions,

            serviceCharge: parseServiceCharge(data.serviceCharge),
            serviceChargeApplicableProductId:
              data.serviceChargeApplicableProductId || null,
          },
          refetchQueries: [
            'salesPosSettingsDetail',
            'salesPosOrdersInlineDetail',
            'salesPosOrdersSelectDetail',
            'salesPosCoversInlineDetail',
            'salesPosCoversSelectDetail',
            'salesPosItemsInlineDetail',
            'salesPosItemsSelectDetail',
            'salesPosSummaryInlineDetail',
            'salesPosSummarySelectDetail',
            'posDetail', // Still used by the Mongolian plugin's POS sync screens.
          ],
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
    [posEdit, posId, reset, t],
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
      <PosSaveAction
        isDirty={hasChanges}
        saving={isSaving}
        onClick={handleHeaderSaveChanges}
      />,
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
          <PosSettingsSection separated title={t('initial-product-categories')}>
            <InitialProductCategories control={control} />
          </PosSettingsSection>

          <PosSettingsSection separated title={t('kiosk-exclude-products')}>
            <KioskExcludeProducts control={control} />
          </PosSettingsSection>

          <PosSettingsSection
            separated
            title={t('product-category-mapping')}
            description={t('map-product-categories-description')}
          >
            <ProductAndCategoryMapping
              posId={posId}
              mappings={catProdMappings}
            />
          </PosSettingsSection>

          <PosSettingsSection separated title={t('remainder-configs')}>
            <RemainderConfigs control={control} />
          </PosSettingsSection>

          <PosSettingsSection separated title={t('service-charge')}>
            <ServiceCharge control={control} />
          </PosSettingsSection>
        </form>
      </Form>
    );
  };

  return (
    <div className="space-y-8">
      <PosSettingsSection title={t('product-groups')}>
        <ProductGroupsList
          posId={posId}
          onSaveStateChange={setProductGroupSaveState}
        />
      </PosSettingsSection>
      {renderProductSettings()}
    </div>
  );
};

export { Products };
