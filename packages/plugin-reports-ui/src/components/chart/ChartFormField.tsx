import { ControlLabel } from '@erxes/ui/src';
import React, { useState } from 'react';
import Select from 'react-select-plus';

type Props = {
  fieldType: string;
  fieldQuery?: string;
  multi?: boolean;
  fieldLabel: string;
  fieldOptions: any[];
  onChange?: (input: any) => void;
  value?: any;
};
const ChartFormField = (props: Props) => {
  const { fieldType, fieldOptions, fieldLabel } = props;
  const [selectValue, setSelectValue] = useState();

  const onSelect = e => {
    setSelectValue(e.value);
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
