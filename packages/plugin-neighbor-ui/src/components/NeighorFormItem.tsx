import React from 'react';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Select from 'react-select-plus';

function NeighborFormItem({ type, options, itemData, onChange }) {
  return (
    <FormGroup>
      <ControlLabel>{type.text}</ControlLabel>
      <Select
        isRequired={true}
        value={itemData}
        onChange={selOptions =>
          onChange(
            type.type,
            selOptions.map(o => o.value)
          )
        }
        options={options.map(o => ({ label: o.name, value: o._id }))}
        clearable={false}
        multi={true}
      />
    </FormGroup>
  );
}

export default NeighborFormItem;
