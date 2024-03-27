import { IField } from '@erxes/ui/src/types';
import React from 'react';
import SelectCard from './SelectCards';

type Props = {
  contentType: string;
  field: IField;
  onChange: (ids: string[], relationType: string) => void;
};

const SelectContacts = (props: Props) => {
  const { field, onChange } = props;
  const { relationType = '' } = field;
  const type = relationType.split(':')[1] as
    | 'deal'
    | 'task'
    | 'ticket'
    | 'purchase';

  if (!['deal', 'ticket', 'task', 'purchase'].includes(type)) {
    return null;
  }

  const onSelect = (value: string[] | string, name: string) => {
    const ids = Array.isArray(value) ? value : [value];
    onChange(ids, relationType);
  };

  return (
    <SelectCard
      type={type}
      label={`${type}s`}
      name={`${type}Ids`}
      multi={true}
      onSelect={onSelect}
    />
  );
};

export default SelectContacts;
