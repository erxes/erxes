import React from 'react';
import {
  IconCreditCard,
  IconCashBanknote,
  IconBuilding,
  IconPhone,
  IconBrandVisa,
  IconBrandMastercard,
  IconFile,
} from '@tabler/icons-react';

export const paymentIconOptions = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'cash', label: 'QPay' },
  { value: 'bank', label: 'SocialPay' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'mobile', label: 'Mobile Payment' },
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
            className={`text-red-600 ${className}`}
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
