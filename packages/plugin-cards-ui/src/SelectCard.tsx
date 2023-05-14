import { queries } from '@erxes/ui-cards/src/boards/graphql';
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

const SelectCards = (props: Props) => {
  const { field, onChange } = props;
  const { relationType = '' } = field;

  const type = relationType.split(':')[1];

  if (!['deal', 'ticket', 'task'].includes(type)) {
    return null;
  }

  const generateOptions = (array: any[] = []): IOption[] => {
    return array.map(item => {
      const cardItem = item || ({} as any);

      return {
        value: cardItem._id,
        label: cardItem.name
      };
    });
  };

  const onSelect = (value: string[] | string, name: string) => {
    const ids = Array.isArray(value) ? value : [value];
    onChange(ids, relationType);
  };

  return (
    <FormGroup>
      <ControlLabel>{`Select ${field.text}`}</ControlLabel>
      <SelectWithSearch
        label={field.text || ''}
        queryName={`${type}s`}
        customQuery={queries[`${type}s`]}
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

export default SelectCards;
