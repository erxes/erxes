import { StepConfig } from '../pos-detail/types/IPosLayout';
import { CustomNode } from '../slot/types';
import {
  IconCreditCard,
  IconCashBanknote,
  IconBuilding,
  IconPhone,
  IconBrandVisa,
  IconBrandMastercard,
  IconFile,
} from '@tabler/icons-react';
import { isStepVisible } from './fieldConfig';

export {
  isFieldVisible,
  isStepVisible,
  posTypeToContext,
  FIELD_VISIBILITY_CONFIG,
  STEP_VISIBILITY_CONFIG,
} from './fieldConfig';
export type {
  FieldContext,
  FieldConfig,
  CategoryFieldConfig,
  PosTypeValue,
} from './fieldConfig';

export const ALLOW_TYPES = [
  { value: 'eat', label: 'Eat', kind: 'sale' },
  { value: 'take', label: 'Take', kind: 'sale' },
  { value: 'delivery', label: 'Delivery', kind: 'sale' },
  { value: 'loss', label: 'Loss', kind: 'out' },
  { value: 'spend', label: 'Spend', kind: 'out' },
  { value: 'reject', label: 'Reject', kind: 'out' },
] as const;

export const options = [
  { value: 'debtAmount', label: 'Зээлийн данс' },
  { value: 'cashAmount', label: 'Бэлэн мөнгө данс' },
  { value: 'cardAmount', label: 'Картын данс' },
  { value: 'card2Amount', label: 'Картын данс нэмэлт' },
  { value: 'mobileAmount', label: 'Мобайл данс' },
  { value: 'debtBarterAmount', label: 'Бартер данс' },
];

export const DefaultNode: CustomNode = {
  id: '1',
  type: 'tableNode',
  position: { x: 250, y: 100 },
  data: {
    label: 'TABLE 1',
    code: '1',
    color: '#4F46E5',
    width: 80,
    height: 80,
    positionX: 250,
    positionY: 100,
    rounded: 0,
    rotateAngle: 0,
    zIndex: 0,
    disabled: false,
  },
};

export const GRID_LAYOUT = {
  SPACING_X: 200,
  SPACING_Y: 150,
  COLUMNS: 3,
  START_X: 100,
  START_Y: 100,
};

export const DEFAULT_SLOT_DIMENSIONS = {
  WIDTH: 80,
  HEIGHT: 80,
};

export const SNAP_GRID = [20, 20] as const;

export const CANVAS = {
  WIDTH: 1000,
  HEIGHT: 1000,
} as const;

export const getSteps = (posType: string | null): StepConfig[] => {
  const baseSteps: StepConfig[] = [
    { value: 'properties', title: 'General information' },
    { value: 'slots', title: 'Slots' },
    { value: 'payments', title: 'Payments' },
    { value: 'permission', title: 'Permission' },
    { value: 'product', title: 'Product & Service' },
    { value: 'appearance', title: 'Appearance' },
    { value: 'screen', title: 'Screen config' },
    { value: 'ebarimt', title: 'Ebarimt config' },
    { value: 'finance', title: 'Finance config' },
    { value: 'delivery', title: 'Delivery config' },
    { value: 'sync', title: 'Sync card' },
  ];

  return baseSteps.filter((step) =>
    isStepVisible(step.value, posType || undefined),
  );
};

export type PosType = 'ecommerce' | 'restaurant' | 'pos';

export const POS_TYPES = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'pos', label: 'POS' },
] as const;

interface PaymentIconProps {
  iconType: string;
  size?: number;
  className?: string;
}

const PaymentIcon: React.FC<PaymentIconProps> = ({
  iconType,
  size = 16,
  className = '',
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'credit-card':
        return <IconCreditCard size={size} className={className} />;
      case 'cash':
        return <IconCashBanknote size={size} className={className} />;
      case 'bank':
        return <IconBuilding size={size} className={className} />;
      case 'mobile':
        return <IconPhone size={size} className={className} />;
      case 'visa':
        return (
          <IconBrandVisa size={size} className={`text-blue-600 ${className}`} />
        );
      case 'mastercard':
        return (
          <IconBrandMastercard
            size={size}
            className={`text-destructive ${className}`}
          />
        );
      case 'sign-alt':
        return <IconFile size={size} className={className} />;
      default:
        return <IconCreditCard size={size} className={className} />;
    }
  };

  return getIcon();
};

export default PaymentIcon;
