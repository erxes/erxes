import {
  IconBrandMastercard,
  IconBrandVisa,
  IconBuilding,
  IconCashBanknote,
  IconCreditCard,
  IconFile,
  IconPhone,
} from '@tabler/icons-react';

export type AllowedPosType =
  | 'eat'
  | 'take'
  | 'delivery'
  | 'loss'
  | 'spend'
  | 'reject';

export const DEFAULT_ALLOW_TYPE: AllowedPosType = 'eat';

export const ALLOWED_TYPE_VALUES: readonly AllowedPosType[] = [
  'eat',
  'take',
  'delivery',
  'loss',
  'spend',
  'reject',
] as const;

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

// Tabs other plugins add (`relationSettingsWidgets`) are keyed under this.
export const POS_RELATION_TAB_PREFIX = 'relation.';

export const getSteps = () => [
  { value: 'properties', title: 'general-information' },
  { value: 'permission', title: 'permission' },
  { value: 'customer', title: 'customer-registration' },
  { value: 'product', title: 'product-and-service' },
  { value: 'payments', title: 'payments' },
  { value: 'delivery', title: 'delivery' },
  { value: 'sync', title: 'sync-card' },
  { value: 'slots', title: 'slots' },
  { value: 'appearance', title: 'brand-color-and-logo' },
  { value: 'screen', title: 'screen' },
  { value: 'automations', title: 'pos-automations' },
];

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
