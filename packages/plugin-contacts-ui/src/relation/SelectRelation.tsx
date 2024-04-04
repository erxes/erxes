import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import { IField } from '@erxes/ui/src/types';
import React from 'react';

type Props = {
  contentType: string;
  field: IField;
  onChange: (ids: string[], relationType: string) => void;
};

const SelectContacts = (props: Props) => {
  const { field, onChange } = props;
  const { relationType = '' } = field;

  if (!['contacts:customer', 'contacts:company'].includes(relationType)) {
    return null;
  }

  const onSelect = (value: string[] | string, name: string) => {
    const ids = Array.isArray(value) ? value : [value];
    onChange(ids, relationType);
  };

  const renderCustomerSelect = () => {
    if (relationType.includes('company')) {
      return null;
    }

    return (
      <SelectCustomers
        showAvatar={false}
        label="Customer"
        name="customerIds"
        multi={true}
        onSelect={onSelect}
      />
    );
  };

  const renderCompanySelect = () => {
    if (relationType.includes('customer')) {
      return null;
    }

    return (
      <SelectCompanies
        showAvatar={false}
        label="Company"
        name="companyIds"
        multi={true}
        onSelect={onSelect}
      />
    );
  };

  return (
    <>
      {renderCustomerSelect()}
      {renderCompanySelect()}
    </>
  );
};

export default SelectContacts;
