import { usePosEdit } from '../../hooks/usePosEdit';
import { getPermissionFormValues } from '../../create-pos/components/permission/permission';
import { usePosDetail } from '../hooks/useDetail';
import { usePosDetailForms } from '../hooks/usePosDetailForm';
import { useLocalPosDetailHandlers } from '../hooks/usePosDetailHandler';
import { PosEditLayout, PosEditTabContent } from './posDetailLayout';
import { RestaurantForm } from '../../create-pos/components/general/restaurant';
import AppearanceForm from '../../create-pos/components/appearance/appearance';
import FinanceConfigForm from '../../create-pos/components/finance/finance';
import RestaurantPaymentsForm from '../../create-pos/components/payments/restaurant-payment';
import PermissionForm from '../../create-pos/components/permission/permission';
import ProductForm from '../../create-pos/components/product/product';
import ScreenConfigForm from '../../create-pos/components/config/screen-config';
import EbarimtConfigForm from '../../create-pos/components/config/ebarimt-config';
import DeliveryConfigForm from '../../create-pos/components/delivery/delivery';
import SyncCardForm from '../../create-pos/components/sync/sync';
import POSSlotsManager from '../../slot/components/slot';
import { useAtom } from 'jotai';
import { posCategoryAtom } from '../../create-pos/states/posCategory';


export const PosEdit = () => {
  const { posDetail, loading, error } = usePosDetail();
  const { posEdit } = usePosEdit();
  const {
    basicInfoForm,
    permissionForm,
    financeForm,
    uiConfigForm,
    productForm,
    paymentForm,
    deliveryConfigForm,
  } = usePosDetailForms(posDetail);

  const [posCategory] = useAtom(posCategoryAtom);

  const {
    permissionFormRef,
    handleBasicInfoSubmit,
    handleProductSubmit,
    handleAppearanceSubmit,
    handleFinanceSubmit,
    handlePaymentSubmit,
    handleDeliverySubmit,
    handlePermissionSubmit,
    handleScreenConfigSubmitNew,
  } = useLocalPosDetailHandlers({
    posDetail,
    basicInfoForm,
    permissionForm,
    financeForm,
    uiConfigForm,
  });

  if (loading) {
    return (
      <PosEditLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading POS details...</p>
          </div>
        </div>
      </PosEditLayout>
    );
  }

  if (error) {
    return (
      <PosEditLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <p>Error loading POS details: {error.message}</p>
          </div>
        </div>
      </PosEditLayout>
    );
  }

  if (!posDetail) {
    return (
      <PosEditLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p>POS not found</p>
          </div>
        </div>
      </PosEditLayout>
    );
  }

  const handleFinalSubmit = async (): Promise<void> => {
    const basicInfoData = basicInfoForm?.getValues();
    const permissionData = getPermissionFormValues(permissionForm);
    const productData = productForm?.getValues();
    const paymentData = paymentForm?.getValues();
    const uiConfigData = uiConfigForm?.getValues();
    const financeData = financeForm?.getValues();
    const deliveryData = deliveryConfigForm?.getValues();

    const refIds = permissionFormRef.current
      ? {
          adminIds: permissionFormRef.current.getAdminIds(),
          cashierIds: permissionFormRef.current.getCashierIds(),
        }
      : { adminIds: [], cashierIds: [] };

    const finalAdminIds = refIds.adminIds.length > 0 ? refIds.adminIds : permissionData.adminIds;
    const finalCashierIds = refIds.cashierIds.length > 0 ? refIds.cashierIds : permissionData.cashierIds;

    const combinedData = {
      _id: posDetail._id,
      ...basicInfoData,
      ...permissionData,
      adminIds: finalAdminIds,
      cashierIds: finalCashierIds,
      productDetails: productData?.productDetails || [],
      catProdMappings: productData?.catProdMappings || [],
      initialCategoryIds: productData?.initialCategoryIds || [],
      kioskExcludeCategoryIds: productData?.kioskExcludeCategoryIds || [],
      kioskExcludeProductIds: productData?.kioskExcludeProductIds || [],
      checkExcludeCategoryIds: productData?.checkExcludeCategoryIds || [],
      paymentIds: paymentData?.paymentIds || [],
      paymentTypes: paymentData?.paymentTypes || [],
      uiOptions: uiConfigData?.uiOptions,
      beginNumber: uiConfigData?.beginNumber,
      maxSkipNumber: uiConfigData?.maxSkipNumber,
      checkRemainder: uiConfigData?.checkRemainder,
      erkhetConfig: financeData ? {
        isSyncErkhet: financeData.isSyncErkhet,
        checkErkhet: financeData.checkErkhet,
        checkInventories: financeData.checkInventories,
        userEmail: financeData.userEmail,
        beginBillNumber: financeData.beginBillNumber,
        defaultPay: financeData.defaultPay,
        account: financeData.account,
        location: financeData.location,
        getRemainder: financeData.getRemainder,
      } : undefined,
      deliveryConfig: deliveryData ? {
        boardId: deliveryData.boardId || '',
        pipeline: deliveryData.pipeline || '',
        stage: deliveryData.stage || '',
        watchedUsers: deliveryData.watchedUsers || '',
        assignedUsers: deliveryData.assignedUsers || '',
        deliveryProduct: deliveryData.deliveryProduct || '',
        watchedUserIds: deliveryData.watchedUserIds || [],
        assignedUserIds: deliveryData.assignedUserIds || [],
      } : undefined,
    };

    const fieldsToUpdate = [
      'name', 'description', 'allowTypes', 'scopeBrandIds', 'branchId',
      'adminTeamMember', 'adminPrintTempBill', 'adminDirectSales', 'adminDirectDiscountLimit',
      'cashierTeamMember', 'cashierPrintTempBill', 'cashierDirectSales', 'cashierDirectDiscountLimit',
      'adminIds', 'cashierIds', 'permissionConfig',
      'productDetails', 'catProdMappings', 'initialCategoryIds',
      'kioskExcludeCategoryIds', 'kioskExcludeProductIds', 'checkExcludeCategoryIds',
      'paymentIds', 'paymentTypes',
      'uiOptions', 'beginNumber', 'maxSkipNumber', 'checkRemainder',
      'erkhetConfig', 'deliveryConfig',
    ];

    await posEdit({ variables: combinedData }, fieldsToUpdate);
  };

  return (
    <PosEditLayout
      posDetail={posDetail}
      form={basicInfoForm}
      onFinalSubmit={handleFinalSubmit}
    >
      <PosEditTabContent value="properties">
        <RestaurantForm
          form={basicInfoForm}
          posDetail={posDetail}
          isReadOnly={false}
        />
      </PosEditTabContent>

      <PosEditTabContent value="payments">
        <RestaurantPaymentsForm posDetail={posDetail} />
      </PosEditTabContent>

      <PosEditTabContent value="permission">
        <PermissionForm form={permissionForm} />
      </PosEditTabContent>

      <PosEditTabContent value="product">
        <ProductForm form={productForm} />
      </PosEditTabContent>

      <PosEditTabContent value="appearance">
        <AppearanceForm
          posDetail={posDetail}
          isReadOnly={false}
          onSubmit={handleAppearanceSubmit}
        />
      </PosEditTabContent>

      <PosEditTabContent value="screen">
        <ScreenConfigForm
          posDetail={posDetail}
          onSubmit={handleScreenConfigSubmitNew}
        />
      </PosEditTabContent>

      <PosEditTabContent value="ebarimt">
        <EbarimtConfigForm posDetail={posDetail} />
      </PosEditTabContent>

      <PosEditTabContent value="finance">
        <FinanceConfigForm
          form={financeForm}
          posDetail={posDetail}
          isReadOnly={false}
          onSubmit={handleFinanceSubmit}
        />
      </PosEditTabContent>

      <PosEditTabContent value="delivery">
        <DeliveryConfigForm form={deliveryConfigForm} posDetail={posDetail} />
      </PosEditTabContent>

      <PosEditTabContent value="sync">
        <SyncCardForm posDetail={posDetail} />
      </PosEditTabContent>

      {posCategory === 'restaurant' && (
        <PosEditTabContent value="slot">
          <POSSlotsManager
            posId={posDetail._id}
            initialNodes={[]}
            onNodesChange={() => {}}
            isCreating={false}
          />
        </PosEditTabContent>
      )}
    </PosEditLayout>
  );
};
