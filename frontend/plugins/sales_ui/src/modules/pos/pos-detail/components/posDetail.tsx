import React from 'react';
import { usePosEdit } from '../../hooks/usePosEdit';
import PermissionForm, {
  getPermissionFormValues,
} from '../../create-pos/components/permission/permission';
import { usePosDetail } from '../hooks/useDetail';
import { usePosDetailForms } from '../hooks/usePosDetailForm';
import { useLocalPosDetailHandlers } from '../hooks/usePosDetailHandler';
import { PosEditLayout, PosEditTabContent } from './posDetailLayout';
import { RestaurantForm } from '../../create-pos/components/general/restaurant';
import AppearanceForm from '../../create-pos/components/appearance/appearance';
import FinanceConfigForm from '../../create-pos/components/finance/finance';
import RestaurantPaymentsForm from '../../create-pos/components/payments/restaurant-payment';
import ProductForm from '../../create-pos/components/product/product';
import ScreenConfigForm from '../../create-pos/components/config/screen-config';
import EbarimtConfigForm from '../../create-pos/components/config/ebarimt-config';
import DeliveryConfigForm from '../../create-pos/components/delivery/delivery';
import SyncCardForm from '../../create-pos/components/sync/sync';
import POSSlotsManager from '../../slot/components/slot';
import { useUpdatePosSlots } from '@/pos/hooks/useSlotAdd';
import { CustomNode } from '@/pos/slot/types';
import { useAtom } from 'jotai';
import { useQueryState, Spinner } from 'erxes-ui';
import { posCategoryAtom } from '../../create-pos/states/posCategory';
import { IScreenConfig } from '@/pos/pos-detail/types/IPos';
import { EbarimtConfigFormValues } from '../../create-pos/components/formSchema';
import { CardsConfig } from '../../create-pos/types/syncCard';

export const PosEdit = () => {
  const { posDetail, loading, error } = usePosDetail();
  const { posEdit, loading: posEditLoading } = usePosEdit();
  const [, setPosId] = useQueryState<string>('pos_id');

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
  const { updatePosSlots } = useUpdatePosSlots();
  const [slotNodes, setSlotNodes] = React.useState<CustomNode[] | null>(null);
  const [screenConfigData, setScreenConfigData] = React.useState<{
    kitchenScreen: IScreenConfig;
    waitingScreen: IScreenConfig;
  } | null>(null);
  const [ebarimtConfigData, setEbarimtConfigData] =
    React.useState<EbarimtConfigFormValues | null>(null);
  const [syncCardConfigData, setSyncCardConfigData] =
    React.useState<CardsConfig | null>(null);

  const {
    permissionFormRef,
    handleAppearanceSubmit,
    handleFinanceSubmit,
    handleScreenConfigSubmitNew,
    handlePaymentSubmit,
    handlePermissionSubmit,
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
        <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
          <Spinner size="md" />
        </div>
      </PosEditLayout>
    );
  }

  if (error) {
    return (
      <PosEditLayout>
        <code>Error loading POS details: {error.message}</code>
      </PosEditLayout>
    );
  }

  if (!posDetail) {
    return (
      <PosEditLayout>
        <code>POS not found</code>
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

    const finalAdminIds =
      refIds.adminIds.length > 0 ? refIds.adminIds : permissionData.adminIds;
    const finalCashierIds =
      refIds.cashierIds.length > 0
        ? refIds.cashierIds
        : permissionData.cashierIds;

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
      productGroups: productData?.productGroups || [],
      isCheckRemainder: productData?.isCheckRemainder || false,
      banFractions: productData?.banFractions || false,
      paymentIds: paymentData?.paymentIds || [],
      paymentTypes: paymentData?.paymentTypes || [],
      erxesAppToken: (paymentData as any)?.erxesAppToken,
      uiOptions: uiConfigData?.uiOptions,
      beginNumber: uiConfigData?.beginNumber,
      maxSkipNumber: uiConfigData?.maxSkipNumber,
      checkRemainder: uiConfigData?.checkRemainder,
      kitchenScreen: screenConfigData?.kitchenScreen,
      waitingScreen: screenConfigData?.waitingScreen,
      ebarimtConfig: ebarimtConfigData || undefined,
      erkhetConfig: financeData
        ? {
            isSyncErkhet: financeData.isSyncErkhet,
            checkErkhet: financeData.checkErkhet,
            checkInventories: financeData.checkInventories,
            userEmail: financeData.userEmail,
            beginBillNumber: financeData.beginBillNumber,
            defaultPay: financeData.defaultPay,
            account: financeData.account,
            location: financeData.location,
            getRemainder: financeData.getRemainder,
          }
        : undefined,
      deliveryConfig: deliveryData
        ? {
            boardId: deliveryData.boardId || '',
            pipeline: deliveryData.pipeline || '',
            stage: deliveryData.stage || '',
            watchedUsers: deliveryData.watchedUsers || '',
            assignedUsers: deliveryData.assignedUsers || '',
            deliveryProduct: deliveryData.deliveryProduct || '',
            watchedUserIds: deliveryData.watchedUserIds || [],
            assignedUserIds: deliveryData.assignedUserIds || [],
            mapField: deliveryData.mapField || '',
          }
        : undefined,
      cardsConfig: syncCardConfigData || undefined,
    };

    const fieldsToUpdate = [
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
      'productDetails',
      'catProdMappings',
      'productGroups',
      'initialCategoryIds',
      'kioskExcludeCategoryIds',
      'kioskExcludeProductIds',
      'checkExcludeCategoryIds',
      'isCheckRemainder',
      'banFractions',
      'paymentIds',
      'paymentTypes',
      'erxesAppToken',
      'uiOptions',
      'beginNumber',
      'maxSkipNumber',
      'checkRemainder',
      'kitchenScreen',
      'waitingScreen',
      'ebarimtConfig',
      'erkhetConfig',
      'deliveryConfig',
      'cardsConfig',
    ];

    const runSlotSave = async () => {
      if (!posDetail?._id) return;
      if (!slotNodes || slotNodes.length === 0) return;

      const slots = slotNodes.map((node) => {
        const x = node.position?.x ?? node.data.positionX ?? 0;
        const y = node.position?.y ?? node.data.positionY ?? 0;
        return {
          _id: node.id,
          posId: posDetail._id,
          name: node.data.label || `TABLE ${node.id}`,
          code: node.data.code || node.id,
          option: {
            width: node.data.width || 80,
            height: node.data.height || 80,
            top: y,
            left: x,
            rotateAngle: node.data.rotateAngle || 0,
            borderRadius: Number(node.data.rounded) || 0,
            color: node.data.color || '#4F46E5',
            zIndex: node.data.zIndex || 0,
            isShape: false,
          },
        };
      });

      await updatePosSlots({ variables: { posId: posDetail._id, slots } });
    };

    try {
      await posEdit({ variables: combinedData }, fieldsToUpdate);
      await runSlotSave();
      setPosId(null);
    } catch (error) {
      console.error('Failed to update POS details or slots', error);
      throw error;
    }
  };

  return (
    <PosEditLayout
      posDetail={posDetail}
      form={basicInfoForm}
      onFinalSubmit={handleFinalSubmit}
      isSubmitting={posEditLoading}
    >
      <PosEditTabContent value="properties">
        <RestaurantForm
          form={basicInfoForm}
          posDetail={posDetail}
          isReadOnly={false}
        />
      </PosEditTabContent>

      <PosEditTabContent value="payments">
        <RestaurantPaymentsForm
          posDetail={posDetail}
          form={paymentForm}
          onFormSubmit={handlePaymentSubmit}
        />
      </PosEditTabContent>

      <PosEditTabContent value="permission">
        <PermissionForm
          ref={permissionFormRef}
          form={permissionForm}
          posDetail={posDetail}
          onSubmit={handlePermissionSubmit}
        />
      </PosEditTabContent>

      <PosEditTabContent value="product">
        <ProductForm form={productForm} posDetail={posDetail} />
      </PosEditTabContent>

      <PosEditTabContent value="appearance">
        <AppearanceForm
          posDetail={posDetail}
          isReadOnly={false}
          onSubmit={handleAppearanceSubmit}
          form={uiConfigForm}
        />
      </PosEditTabContent>

      <PosEditTabContent value="screen">
        <ScreenConfigForm
          posDetail={posDetail}
          onSubmit={handleScreenConfigSubmitNew}
          onDataChange={setScreenConfigData}
        />
      </PosEditTabContent>

      <PosEditTabContent value="ebarimt">
        <EbarimtConfigForm
          posDetail={posDetail}
          onDataChange={setEbarimtConfigData}
        />
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
        <SyncCardForm
          posDetail={posDetail}
          onDataChange={setSyncCardConfigData}
        />
      </PosEditTabContent>

      {posCategory === 'restaurant' && (
        <PosEditTabContent value="slot">
          <POSSlotsManager
            posId={posDetail._id}
            initialNodes={[]}
            isCreating={false}
            onNodesChange={(nodes: CustomNode[]) => setSlotNodes(nodes)}
          />
        </PosEditTabContent>
      )}
    </PosEditLayout>
  );
};
