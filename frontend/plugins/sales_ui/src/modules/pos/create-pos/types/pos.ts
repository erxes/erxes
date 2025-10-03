import { UseFormReturn } from 'react-hook-form';
import {
  BasicInfoFormValues,
  DeliveryConfigFormValues,
  FinanceConfigFormValues,
  PaymentFormValues,
  PermissionFormValues,
  PosDetailFormValues,
  ProductFormValues,
} from '../components/formSchema';
import { CustomNode } from '@/pos/slot/types';

export interface TabConfig {
  value: string;
  component: React.ReactNode;
}
export interface GetPosCreateTabsProps {
  posCategory: 'ecommerce' | 'restaurant' | 'kiosk';
  forms: {
    deliveryConfig: UseFormReturn<DeliveryConfigFormValues>;
    financeConfig: UseFormReturn<FinanceConfigFormValues>;
    basicInfo: UseFormReturn<BasicInfoFormValues>;
    permission: UseFormReturn<PermissionFormValues>;
    product: UseFormReturn<ProductFormValues>;
    payment: UseFormReturn<PaymentFormValues>;
  };
  handlers: {
    handleNodesUpdate: (nodes: CustomNode[]) => void;
    handleDeliveryConfigUpdate?: (data: DeliveryConfigFormValues) => void;
    handleFinanceConfigSubmit?: (data: FinanceConfigFormValues) => void;
  };
  data: {
    createdPosId: string | null;
    slotNodes: CustomNode[];
  };
}

export interface UpdatePosDetailResult {
  posDetailUpdate: PosDetailFormValues & { id: string };
}

export interface UpdatePosDetailVariables {
  id: string;
  input: Partial<PosDetailFormValues>;
}
