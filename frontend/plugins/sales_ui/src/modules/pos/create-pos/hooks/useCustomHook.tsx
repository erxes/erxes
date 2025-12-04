import { useState, useCallback } from 'react';
import { useToast, useQueryState } from 'erxes-ui';
import { CustomNode } from '@/pos/slot/types';
import {
  BasicInfoFormValues,
  FormStepData,
  DeliveryConfigFormValues,
  FinanceConfigFormValues,
  EbarimtConfigFormValues,
  PermissionFormValues,
} from '../components/formSchema';
import { useSubmitPosForm } from '@/pos/hooks/usePosAdd';
import { useUpdatePosSlots } from '@/pos/hooks/useSlotAdd';
import { usePosEditProductGroup } from '@/pos/hooks/usePosEditProductGroup';
import { TOAST_MESSAGES } from '@/pos/constants';
import { SlotData, UsePosCreateHandlersProps } from '@/pos/create-pos/types';
import { IScreenConfig } from '../../pos-detail/types/IPos';

const transformSlotNodes = (nodes: CustomNode[], posId: string): SlotData[] => {
  return nodes.map((node) => ({
    code: node.data.code,
    name: node.data.label,
    posId,
    option: {
      width: node.data.width,
      height: node.data.height,
      top: node.data.positionY,
      left: node.data.positionX,
      rotateAngle: node.data.rotateAngle,
      borderRadius: node.data.rounded ? 8 : 0,
      color: node.data.color,
      zIndex: node.data.zIndex,
      isShape: false,
    },
  }));
};

const validateDeliveryConfigData = (
  deliveryData: DeliveryConfigFormValues,
): boolean => {
  return !!(
    deliveryData.boardId &&
    deliveryData.pipeline &&
    deliveryData.stage &&
    deliveryData.deliveryProduct
  );
};

export const usePosCreateHandlers = ({
  forms,
  formStepData,
}: UsePosCreateHandlersProps) => {
  const {
    submitForm,
    loading: posLoading,
    error: posError,
  } = useSubmitPosForm();
  const {
    updatePosSlots,
    loading: slotLoading,
    error: slotError,
  } = useUpdatePosSlots();
  const { productGroupSave } = usePosEditProductGroup();
  const { toast } = useToast();
  const [, setCreate] = useQueryState<boolean>('create', {
    defaultValue: false,
  });

  const [createdPosId, setCreatedPosId] = useState<string | null>(null);
  const [slotNodes, setSlotNodes] = useState<CustomNode[]>([]);
  const [screenConfigData, setScreenConfigData] = useState<{
    kitchenScreen?: IScreenConfig;
    waitingScreen?: IScreenConfig;
  }>({});
  const [ebarimtConfigData, setEbarimtConfigData] = useState<
    EbarimtConfigFormValues | undefined
  >();
  const [permissionData, setPermissionData] = useState<
    PermissionFormValues | undefined
  >();

  const handleBasicInfoSubmit = useCallback(
    (data: BasicInfoFormValues) => {
      forms.basicInfo.reset(data);
    },
    [forms.basicInfo],
  );

  const handleDeliveryConfigSubmit = useCallback(
    (data: DeliveryConfigFormValues) => {
      if (!forms.deliveryConfig) return;
      forms.deliveryConfig.reset(data);
    },
    [forms.deliveryConfig],
  );

  const handleFinanceConfigSubmit = useCallback(
    (data: FinanceConfigFormValues) => {
      if (!forms.financeConfig) return;
      forms.financeConfig.reset(data);
    },
    [forms.financeConfig],
  );

  const handleScreenConfigSubmit = useCallback(
    async (data: {
      kitchenScreen: IScreenConfig;
      waitingScreen: IScreenConfig;
    }) => {
      setScreenConfigData(data);
    },
    [],
  );

  const handleEbarimtConfigChange = useCallback(
    (data: EbarimtConfigFormValues) => {
      setEbarimtConfigData(data);
    },
    [],
  );

  const handlePermissionSubmit = useCallback((data: PermissionFormValues) => {
    setPermissionData(data);
  }, []);

  const handleSaveSlots = useCallback(
    async (posId: string): Promise<void> => {
      if (!posId || slotNodes.length === 0) return;

      try {
        const slotsData = transformSlotNodes(slotNodes, posId);
        await updatePosSlots({ variables: { posId, slots: slotsData } });
        toast({
          title: TOAST_MESSAGES.SLOTS_SAVED,
          description: `Saved ${slotsData.length} slots`,
        });
      } catch (error) {
        toast({
          title: TOAST_MESSAGES.SLOTS_SAVE_FAILED,
          description: TOAST_MESSAGES.TRY_AGAIN,
          variant: 'destructive',
        });
        throw error;
      }
    },
    [slotNodes, updatePosSlots, toast],
  );

  const handleNodesUpdate = useCallback((nodes: CustomNode[]) => {
    setSlotNodes(nodes);
  }, []);

  const handleFinalSubmit = useCallback(async (): Promise<void> => {
    try {
      const basicInfo = forms.basicInfo.getValues();

      if (!basicInfo.name || !basicInfo.description) {
        toast({
          title: 'Missing required fields',
          description: 'Name and Description are required.',
          variant: 'destructive',
        });
        return;
      }

      const finalFormStepData: FormStepData = {
        ...formStepData,
        basicInfo,
        permission: permissionData || forms.permission.getValues(),
        ...(forms.uiConfig && { uiConfig: forms.uiConfig.getValues() }),
        product: forms.product.getValues(),
        payment: forms.payment.getValues(),
        ...(forms.financeConfig && {
          financeConfig: forms.financeConfig.getValues(),
        }),
        ...(forms.deliveryConfig && {
          deliveryConfig: forms.deliveryConfig.getValues(),
        }),
        ...screenConfigData,
        ...(ebarimtConfigData && { ebarimtConfig: ebarimtConfigData }),
      };

      const result = await submitForm(finalFormStepData);
      if (!result?.data?.posAdd?._id) {
        throw new Error('POS creation failed: No ID returned');
      }

      const posId = result.data.posAdd._id;
      setCreatedPosId(posId);

      // Save product groups if any
      const productData = forms.product.getValues();
      if (productData?.productGroups && productData.productGroups.length > 0) {
        await productGroupSave(
          {
            variables: {
              posId,
              groups: productData.productGroups,
            },
          },
          ['posId', 'groups'],
        );
      }

      if (slotNodes.length > 0) {
        await handleSaveSlots(posId);
      }

      toast({
        title: TOAST_MESSAGES.POS_CREATED,
        description: 'POS has been created successfully',
      });

      setCreate(false);
    } catch (error) {
      toast({
        title: TOAST_MESSAGES.POS_CREATION_FAILED,
        description: TOAST_MESSAGES.TRY_AGAIN,
        variant: 'destructive',
      });
      throw error;
    }
  }, [
    forms,
    formStepData,
    submitForm,
    slotNodes,
    handleSaveSlots,
    toast,
    setCreate,
    screenConfigData,
    ebarimtConfigData,
    permissionData,
    productGroupSave,
  ]);

  const getCurrentDeliveryConfig = useCallback(() => {
    return forms.deliveryConfig ? forms.deliveryConfig.getValues() : null;
  }, [forms.deliveryConfig]);

  const getCurrentFinanceConfig = useCallback(() => {
    return forms.financeConfig ? forms.financeConfig.getValues() : null;
  }, [forms.financeConfig]);

  const validateDeliveryConfig = useCallback((): boolean => {
    if (!forms.deliveryConfig) return true;
    return validateDeliveryConfigData(forms.deliveryConfig.getValues());
  }, [forms.deliveryConfig]);

  const getAllFormValues = useCallback(() => {
    return {
      basicInfo: forms.basicInfo.getValues(),
      permission: forms.permission.getValues(),
      product: forms.product.getValues(),
      payment: forms.payment.getValues(),
      ...(forms.uiConfig && { uiConfig: forms.uiConfig.getValues() }),
      ...(forms.deliveryConfig && {
        deliveryConfig: forms.deliveryConfig.getValues(),
      }),
      ...(forms.financeConfig && {
        financeConfig: forms.financeConfig.getValues(),
      }),
    };
  }, [forms]);

  return {
    handleBasicInfoSubmit,
    handlePermissionSubmit,
    handleDeliveryConfigSubmit,
    handleFinanceConfigSubmit,
    handleScreenConfigSubmit,
    handleEbarimtConfigChange,
    handleFinalSubmit,
    handleNodesUpdate,
    handleSaveSlots,
    getCurrentDeliveryConfig,
    getCurrentFinanceConfig,
    validateDeliveryConfig,
    getAllFormValues,
    loading: posLoading || slotLoading,
    error: posError || slotError,
    createdPosId,
    slotNodes,
  };
};
