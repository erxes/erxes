import { useAtomValue } from 'jotai';
import { customerDataAtom } from '../states';
import { useMemo } from 'react';

export const useCustomerData = () => {
  const customerData = useAtomValue(customerDataAtom);
  const { phones, emails, _id } = customerData || {};
  const hasEmailOrPhone = useMemo(() => {
    return (
      (emails?.length && emails?.length > 0) ||
      (phones?.length && phones?.length > 0)
    );
  }, [emails, phones]);
  return { customer: customerData, hasEmailOrPhone, customerId: _id };
};
