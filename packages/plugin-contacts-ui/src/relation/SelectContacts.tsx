import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IField, IOption } from '@erxes/ui/src/types';
import React from 'react';

import queries from './queries';

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

  const generateOptions = (array: any[] = []): IOption[] => {
    return array.map(item => {
      const contact = item || ({} as any);

      return {
        value: contact._id,
        label: relationType.includes('customer')
          ? `${contact.firstName || ''} ${contact.lastName || ''}`
          : contact.primaryName || ''
      };
    });
  };

  const onSelect = (value: string[] | string, name: string) => {
    const ids = Array.isArray(value) ? value : [value];
    onChange(ids, relationType);
  };

  const qry = relationType.includes('customer')
    ? queries.customers
    : queries.companies;

  return (
    <FormGroup>
      <ControlLabel>{`Select ${field.text}`}</ControlLabel>
      <SelectWithSearch
        label={field.text || ''}
        queryName={
          relationType.includes('customer') ? 'customers' : 'companies'
        }
        customQuery={qry}
        multi={true}
        name={'relation'}
        initialValue={[]}
        showAvatar={false}
        generateOptions={generateOptions}
        onSelect={onSelect}
      />
    </FormGroup>
  );
};

export default SelectContacts;
