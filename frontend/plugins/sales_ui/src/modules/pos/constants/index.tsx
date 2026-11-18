import {
  IconAffiliate,
  IconBrandMastercard,
  IconBrandVisa,
  IconBuilding,
  IconCashBanknote,
  IconCreditCard,
  IconDeviceDesktop,
  IconFile,
  IconInfoCircle,
  IconLayoutGrid,
  IconPackage,
  IconPalette,
  IconPhone,
  IconRefresh,
  IconShieldLock,
  IconTruckDelivery,
  IconUserPlus,
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

export const POS_RELATION_TAB_PREFIX = 'relation.';

export const POS_SETTINGS_TABS = [
  {
    value: 'properties',
    label: 'General Information',
    labelKey: 'general-information',
    icon: IconInfoCircle,
  },
  {
    value: 'permission',
    label: 'Permission',
    labelKey: 'permission',
    icon: IconShieldLock,
  },
  {
    value: 'customer',
    label: 'Customer registration',
    labelKey: 'customer-registration',
    icon: IconUserPlus,
  },
  {
    value: 'product',
    label: 'Product & Service',
    labelKey: 'product-and-service',
    icon: IconPackage,
  },
  {
    value: 'payments',
    label: 'Payments',
    labelKey: 'payments',
    icon: IconCreditCard,
  },
  {
    value: 'delivery',
    label: 'Delivery',
    labelKey: 'delivery',
    icon: IconTruckDelivery,
  },
  {
    value: 'sync',
    label: 'Sync Card',
    labelKey: 'sync-card',
    icon: IconRefresh,
  },
  { value: 'slots', label: 'Slots', labelKey: 'slots', icon: IconLayoutGrid },
  {
    value: 'appearance',
    label: 'Brand Color & Logo',
    labelKey: 'brand-color-and-logo',
    icon: IconPalette,
  },
  {
    value: 'screen',
    label: 'Screen',
    labelKey: 'screen',
    icon: IconDeviceDesktop,
  },
  {
    value: 'automations',
    label: 'Automations',
    labelKey: 'pos-automations',
    icon: IconAffiliate,
  },
] as const;

export type TPosSettingsTab = (typeof POS_SETTINGS_TABS)[number]['value'];

export const POS_GENERAL_TAB: TPosSettingsTab = 'properties';

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
