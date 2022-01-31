import CustomerSection from 'erxes-ui/lib/customers/components/CustomerSection';
import { ICustomerSectionProps } from 'erxes-ui/lib/customers/components/CustomerSection';
import React from 'react';
import ActionSection from '../../containers/common/ActionSection';

export default (props: ICustomerSectionProps) => {
  return <CustomerSection {...props} actionSection={ActionSection} />;
};
