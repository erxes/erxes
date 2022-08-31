import ActionSection from '@erxes/ui-contacts/src/customers/containers/ActionSection';
import CustomerSection from '@erxes/ui-contacts/src/customers/components/CustomerSection';
import { ICustomerSectionProps } from '@erxes/ui-contacts/src/customers/components/CustomerSection';
import React from 'react';

export default (props: ICustomerSectionProps) => {
  return <CustomerSection {...props} actionSection={ActionSection} />;
};
