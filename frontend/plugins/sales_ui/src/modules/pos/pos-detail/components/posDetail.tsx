import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { usePosDetail } from '../hooks/useDetail';
import { posCategoryAtom } from '@/pos/create-pos/states/posCategory';
import { usePosEdit } from '@/pos/hooks/usePosEdit';
import {
  type BasicInfoFormValues,
  basicInfoSchema,
  FinanceConfigFormValues,
  type PermissionFormValues,
  permissionSchema,
  ProductFormValues,
} from '@/pos/create-pos/components/formSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PosEditLayout, PosEditTabContent } from './posDetailLayout';
import { EcommerceForm } from '@/pos/create-pos/components/general/ecommerce';
import { RestaurantForm } from '@/pos/create-pos/components/general/restaurant';
import POSSlotsManager from '@/pos/slot/components/slot';
import EcommercePaymentsForm from '@/pos/create-pos/components/payments/ecommerce-payment';
import RestaurantPaymentsForm from '@/pos/create-pos/components/payments/restaurant-payment';
import PermissionForm, {
  type PermissionFormRef,
  getPermissionFormValues,
} from '@/pos/create-pos/components/permission/permission';
import AppearanceForm from '@/pos/create-pos/components/appearance/appearance';
import ScreenConfigForm from '@/pos/create-pos/components/config/screen-config';
import EbarimtConfigForm from '@/pos/create-pos/components/config/ebarimt-config';
import FinanceConfigForm from '@/pos/create-pos/components/finance/finance';
import DeliveryConfigForm from '@/pos/create-pos/components/delivery/delivery';
import SyncCardForm from '@/pos/create-pos/components/sync/sync';
import type { JSX } from 'react/jsx-runtime';
import ProductForm from '@/pos/create-pos/components/product/product';
import { usePosEditProductGroup } from '~/modules/pos/hooks/usePosEditProductGroup';
import { useProductGroups } from '~/modules/pos/pos-detail/hooks/useProductGroup';
import { useToast } from 'erxes-ui/hooks';
import { TOAST_MESSAGES } from '~/modules/pos/constants';

export const PosEdit = () => {
  const { posDetail } = usePosDetail();
  const { toast } = useToast();
  const [posCategory, setPosCategory] = useAtom(posCategoryAtom);
  const { posEdit } = usePosEdit();
  const { productGroupSave } = usePosEditProductGroup();
  const { productGroups, refetch: refetchProductGroup } = useProductGroups(
    posDetail?._id,
  );
  const permissionFormRef = useRef<PermissionFormRef>(null);

  const basicInfoForm = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: '',
      description: '',
      allowTypes: [],
      scopeBrandIds: [],
      branchId: '',
      departmentId: '',
    },
  });
  const productForm = useForm<ProductFormValues>({
    defaultValues: {
      productDetails: [],
      catProdMappings: [],
      initialCategoryIds: [],
      kioskExcludeCategoryIds: [],
      kioskExcludeProductIds: [],
      checkExcludeCategoryIds: [],
      productGroups: [],
    },
  });

  const permissionForm = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      adminTeamMember: '',
      adminPrintTempBill: false,
      adminDirectSales: false,
      adminDirectDiscountLimit: '',
      cashierTeamMember: '',
      cashierPrintTempBill: false,
      cashierDirectSales: false,
      cashierDirectDiscountLimit: '',
      adminIds: [],
      cashierIds: [],
      permissionConfig: {},
    },
  });

  const financeForm = useForm<FinanceConfigFormValues>({
    defaultValues: {
      isSyncErkhet: false,
      checkErkhet: false,
      checkInventories: false,
      userEmail: '',
      beginBillNumber: '',
      defaultPay: '',
      account: '',
      location: '',
      getRemainder: false,
    },
  });

  useEffect(() => {
    if (!posDetail) return;

    if (posDetail.category) {
      setPosCategory(posDetail.category);
    }

    basicInfoForm.reset({
      name: posDetail.name || '',
      description: posDetail.description || '',
      allowTypes: posDetail.allowTypes || [],
      scopeBrandIds: posDetail.scopeBrandIds || [],
      branchId: posDetail.branchId || '',
      departmentId: posDetail.departmentId || '',
    });

    const adminId = posDetail.adminTeamMember || posDetail.adminIds?.[0] || '';
    const cashierId =
      posDetail.cashierTeamMember || posDetail.cashierIds?.[0] || '';

    permissionForm.reset({
      adminTeamMember: adminId,
      adminPrintTempBill: posDetail.adminPrintTempBill || false,
      adminDirectSales: posDetail.adminDirectSales || false,
      adminDirectDiscountLimit: posDetail.adminDirectDiscountLimit || '',
      cashierTeamMember: cashierId,
      cashierPrintTempBill: posDetail.cashierPrintTempBill || false,
      cashierDirectSales: posDetail.cashierDirectSales || false,
      cashierDirectDiscountLimit: posDetail.cashierDirectDiscountLimit || '',
      adminIds: adminId ? [adminId] : posDetail.adminIds || [],
      cashierIds: cashierId ? [cashierId] : posDetail.cashierIds || [],
      permissionConfig: posDetail.permissionConfig || {},
    });
  }, [posDetail, basicInfoForm, permissionForm, setPosCategory]);

  const handleFinalSubmit = async () => {
    const currentBasicInfo = basicInfoForm.getValues();
    const permissionValues = getPermissionFormValues(permissionForm);
    const refIds = permissionFormRef.current
      ? {
          adminIds: permissionFormRef.current.getAdminIds(),
          cashierIds: permissionFormRef.current.getCashierIds(),
        }
      : { adminIds: [], cashierIds: [] };

    const finalAdminIds =
      refIds.adminIds.length > 0 ? refIds.adminIds : permissionValues.adminIds;
    const finalCashierIds =
      refIds.cashierIds.length > 0
        ? refIds.cashierIds
        : permissionValues.cashierIds;

    const productValues = productForm.getValues();

    const finalData = {
      _id: posDetail._id,
      ...currentBasicInfo,
      ...permissionValues,
      adminIds: finalAdminIds,
      cashierIds: finalCashierIds,
      catProdMappings: [
        ...productValues.catProdMappings.map((item) => ({
          _id: `${Math.random()}`,
          name: item.name,
          code: item.code,
          categoryId: item.categoryId,
          productId: item.productId,
        })),
      ],
      initialCategoryIds: [...productValues.initialCategoryIds],
      kioskExcludeCategoryIds: [...productValues.kioskExcludeCategoryIds],
      kioskExcludeProductIds: [...productValues.kioskExcludeProductIds],
      checkExcludeCategoryIds: [...productValues.checkExcludeCategoryIds],
    };

    const posEditResponse = await posEdit(
      {
        variables: finalData,
      },
      [
        'name',
        'description',
        'allowTypes',
        'scopeBrandIds',
        'branchId',
        'adminTeamMember',
        'adminPrintTempBill',
        'adminDirectSales',
        'adminDirectDiscountLimit',
        'cashierTeamMember',
        'cashierPrintTempBill',
        'cashierDirectSales',
        'cashierDirectDiscountLimit',
        'adminIds',
        'cashierIds',
        'permissionConfig',
      ],
    );
    const finalDataProductGroup = {
      posId: posDetail._id,
      groups: [
        ...productValues.productGroups.map((item) => ({
          _id: `temporaryId.${Math.random()}`,
          name: `temporaryId.${Math.random()}`,
          categoryIds: item.categoryIds,
          excludedCategoryIds: item.excludedCategoryIds,
          excludedProductIds: item.excludedProductIds,
        })),
      ],
    };
    toast({
      title: TOAST_MESSAGES.POS_EDITED,
      description: `Saved`,
      variant: 'destructive',
    });
    if (posEditResponse.data?.posEdit?._id) {
      await productGroupSave({ variables: finalDataProductGroup }, []);
      refetchProductGroup();
    }
  };

  const getCategoryComponent = (
    ecommerceComponent: JSX.Element,
    restaurantComponent: JSX.Element,
  ) => {
    if (posCategory === 'ecommerce') return ecommerceComponent;
    if (posCategory === 'restaurant') return restaurantComponent;
    return null;
  };

  if (!posDetail) return null;

  return (
    <PosEditLayout
      form={basicInfoForm}
      onFinalSubmit={handleFinalSubmit}
      posDetail={posDetail}
    >
      <PosEditTabContent value="properties">
        {getCategoryComponent(
          <EcommerceForm form={basicInfoForm} posDetail={posDetail} />,
          <RestaurantForm form={basicInfoForm} posDetail={posDetail} />,
        )}
      </PosEditTabContent>

      {posCategory === 'restaurant' && (
        <PosEditTabContent value="slot">
          <POSSlotsManager posId={posDetail._id} />
        </PosEditTabContent>
      )}

      <PosEditTabContent value="payments">
        {getCategoryComponent(
          <EcommercePaymentsForm posDetail={posDetail} />,
          <RestaurantPaymentsForm posDetail={posDetail} />,
        )}
      </PosEditTabContent>

      <PosEditTabContent value="permission">
        <PermissionForm
          ref={permissionFormRef}
          form={permissionForm}
          posDetail={posDetail}
        />
      </PosEditTabContent>

      <PosEditTabContent value="product">
        <ProductForm
          posDetail={posDetail}
          productGroups={productGroups}
          form={productForm}
        />
      </PosEditTabContent>

      <PosEditTabContent value="appearance">
        <AppearanceForm posDetail={posDetail} />
      </PosEditTabContent>

      <PosEditTabContent value="screen">
        <ScreenConfigForm posDetail={posDetail} />
      </PosEditTabContent>

      <PosEditTabContent value="ebarimt">
        <EbarimtConfigForm posDetail={posDetail} />
      </PosEditTabContent>

      <PosEditTabContent value="finance">
        <FinanceConfigForm form={financeForm} posDetail={posDetail} />
      </PosEditTabContent>

      <PosEditTabContent value="delivery">
        <DeliveryConfigForm posDetail={posDetail} />
      </PosEditTabContent>

      <PosEditTabContent value="sync">
        <SyncCardForm posDetail={posDetail} />
      </PosEditTabContent>
    </PosEditLayout>
  );
};
