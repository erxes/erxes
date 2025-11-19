import { useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { IPosDetail, IScreenConfig } from '../types/IPos';
import {
  BasicInfoFormValues,
  FinanceConfigFormValues,
  PermissionFormValues,
  ProductFormValues,
  UiConfigFormValues,
  PaymentFormValues,
  DeliveryConfigFormValues,
} from '../../create-pos/components/formSchema';
import { usePosEdit } from '../../hooks/usePosEdit';
import {
  getPermissionFormValues,
  PermissionFormRef,
} from '../../create-pos/components/permission/permission';

interface UsePosDetailHandlersProps {
  posDetail?: IPosDetail;
  basicInfoForm: UseFormReturn<BasicInfoFormValues>;
  permissionForm: UseFormReturn<PermissionFormValues>;
  financeForm: UseFormReturn<FinanceConfigFormValues>;
  uiConfigForm: UseFormReturn<UiConfigFormValues>;
}

export const useLocalPosDetailHandlers = ({
  posDetail,
  basicInfoForm,
  permissionForm,
  financeForm,
  uiConfigForm,
}: UsePosDetailHandlersProps) => {
  const { posEdit } = usePosEdit();
  const permissionFormRef = useRef<PermissionFormRef>(null);

  if (!posDetail) {
    return {
      permissionFormRef,
      handleBasicInfoSubmit: async () => {},
      handleProductSubmit: async () => {},
      handleAppearanceSubmit: async () => {},
      handleScreenConfigSubmit: async () => {},
      handleFinanceSubmit: async () => {},
    };
  }

  const handleBasicInfoSubmit = async () => {
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

    const finalData = {
      _id: posDetail._id,
      ...currentBasicInfo,
      ...permissionValues,
      adminIds: finalAdminIds,
      cashierIds: finalCashierIds,
    };

    await posEdit({ variables: finalData }, [
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
    ]);
  };

  const handleProductSubmit = async (data: ProductFormValues) => {
    await posEdit(
      {
        variables: {
          _id: posDetail._id,
          productDetails: data.productDetails,
          catProdMappings: data.catProdMappings,
          initialCategoryIds: data.initialCategoryIds,
          kioskExcludeCategoryIds: data.kioskExcludeCategoryIds,
          kioskExcludeProductIds: data.kioskExcludeProductIds,
          checkExcludeCategoryIds: data.checkExcludeCategoryIds,
        },
      },
      [
        'productDetails',
        'catProdMappings',
        'initialCategoryIds',
        'kioskExcludeCategoryIds',
        'kioskExcludeProductIds',
        'checkExcludeCategoryIds',
      ],
    );
  };

  const handleAppearanceSubmit = async (data: UiConfigFormValues) => {
    await posEdit(
      {
        variables: {
          _id: posDetail._id,
          uiOptions: data.uiOptions,
          beginNumber: data.beginNumber,
          maxSkipNumber: data.maxSkipNumber,
          checkRemainder: data.checkRemainder,
        },
      },
      ['uiOptions', 'beginNumber', 'maxSkipNumber', 'checkRemainder'],
    );
  };

  const handleScreenConfigSubmit = async (data: {
    kitchenScreen: IScreenConfig;
    waitingScreen: IScreenConfig;
  }) => {
    await posEdit(
      {
        variables: {
          _id: posDetail._id,
          kitchenScreen: data.kitchenScreen,
          waitingScreen: data.waitingScreen,
        },
      },
      ['kitchenScreen', 'waitingScreen'],
    );
  };

  const handleFinanceSubmit = async (data: FinanceConfigFormValues) => {
    await posEdit(
      {
        variables: {
          _id: posDetail._id,
          erkhetConfig: {
            isSyncErkhet: data.isSyncErkhet,
            checkErkhet: data.checkErkhet,
            checkInventories: data.checkInventories,
            userEmail: data.userEmail,
            beginBillNumber: data.beginBillNumber,
            defaultPay: data.defaultPay,
            account: data.account,
            location: data.location,
            getRemainder: data.getRemainder,
          },
        },
      },
      ['erkhetConfig'],
    );
  };

  const handlePaymentSubmit = async (data: PaymentFormValues) => {
    await posEdit(
      {
        variables: {
          _id: posDetail._id,
          paymentIds: data.paymentIds || [],
          paymentTypes: data.paymentTypes || [],
          erxesAppToken: (data as any)?.erxesAppToken,
        },
      },
      ['paymentIds', 'paymentTypes', 'erxesAppToken'],
    );
  };

  const handleDeliverySubmit = async (data: DeliveryConfigFormValues) => {
    await posEdit(
      {
        variables: {
          _id: posDetail._id,
          deliveryConfig: {
            boardId: data.boardId || '',
            pipeline: data.pipeline || '',
            stage: data.stage || '',
            watchedUsers: data.watchedUsers || '',
            assignedUsers: data.assignedUsers || '',
            deliveryProduct: data.deliveryProduct || '',
            watchedUserIds: data.watchedUserIds || [],
            assignedUserIds: data.assignedUserIds || [],
            mapField: data.mapField || '',
          },
        },
      },
      ['deliveryConfig'],
    );
  };

  const handleScreenConfigSubmitNew = async (data: {
    kitchenScreen: IScreenConfig;
    waitingScreen: IScreenConfig;
  }) => {
    await posEdit(
      {
        variables: {
          _id: posDetail._id,
          kitchenScreen: data.kitchenScreen,
          waitingScreen: data.waitingScreen,
        },
      },
      ['kitchenScreen', 'waitingScreen'],
    );
  };

  const handlePermissionSubmit = async () => {
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

    await posEdit(
      {
        variables: {
          _id: posDetail._id,
          ...permissionValues,
          adminIds: finalAdminIds,
          cashierIds: finalCashierIds,
        },
      },
      [
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
  };

  return {
    permissionFormRef,
    handleBasicInfoSubmit,
    handleProductSubmit,
    handleAppearanceSubmit,
    handleScreenConfigSubmit,
    handleFinanceSubmit,
    handlePaymentSubmit,
    handleDeliverySubmit,
    handlePermissionSubmit,
    handleScreenConfigSubmitNew,
  };
};
