import { IField } from '@erxes/ui/src/types';
import React from 'react';
import SelectCars from './SelectCars';

type Props = {
  contentType: string;
  field: IField;
  onChange: (ids: string[], relationType: string) => void;
};

const SelectContacts = (props: Props) => {
  const { field, onChange } = props;
  const { relationType = '' } = field;

  if (relationType !== 'cars:car') {
    return null;
  }

  const onSelect = (value: string[] | string, name: string) => {
    const ids = Array.isArray(value) ? value : [value];
    onChange(ids, relationType);
  };

  return (
    <SelectCars label="Cars" name="carIds" multi={true} onSelect={onSelect} />
  );
};

export default SelectContacts;
