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

interface PaymentIconProps {
  iconType: string;
  size?: number;
  className?: string;
}

const PaymentIcon: React.FC<PaymentIconProps> = ({ 
  iconType, 
  size = 16, 
  className = "" 
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
        return <IconBrandVisa size={size} className={`${className} text-blue-600`} />;
      case 'mastercard':
        return <IconBrandMastercard size={size} className={`${className} text-red-600`} />;
      case 'sign-alt':
        return <IconFile size={size} className={className} />;
      default:
        return <IconCreditCard size={size} className={className} />;
    }
  };

  return getIcon();
};

export default PaymentIcon;