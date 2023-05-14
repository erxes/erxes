import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IField, IOption } from '@erxes/ui/src/types';
import React from 'react';

type Props = {
  contentType: string;
  field: IField;
  onChange: (ids: string[], relationType: string) => void;
};

const SelectCard = (props: Props) => {
  const { field, onChange } = props;
  const { relationType = '' } = field;

  if (!relationType.includes('card')) {
    return null;
  }

  console.log('SelectCard props', props);
  return <>Select card</>;
};

export default SelectCard;
