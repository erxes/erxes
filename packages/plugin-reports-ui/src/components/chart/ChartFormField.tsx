import { ControlLabel } from '@erxes/ui/src';
import React, { useState } from 'react';
import Select from 'react-select-plus';

type Props = {
  fieldType: string;
  fieldQuery?: string;
  multi?: boolean;
  fieldLabel: string;
  fieldOptions: any[];
  initialValue?: any;
  onChange: (input: any) => void;
  value?: any;
};
const ChartFormField = (props: Props) => {
  const { fieldType, fieldOptions, fieldLabel, initialValue, onChange } = props;
  const [selectValue, setSelectValue] = useState(initialValue);

  const onSelect = e => {
    setSelectValue(e.value);
    onChange(e);
  };

  switch (fieldType) {
    case 'select':
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>
          <Select
            value={selectValue}
            onChange={onSelect}
            options={fieldOptions}
            placeholder={fieldLabel}
          />
        </div>
      );

    default:
      return <></>;
  }
};

export default ChartFormField;
