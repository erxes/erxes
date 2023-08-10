import { IField } from '@erxes/ui/src/types';
import React from 'react';
import FormControl from '@erxes/ui/src/components/form/Control';
import Select from 'react-select-plus';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  field?: IField;
  fields: IField[];
  onChange: (field: any) => void;
};

const GroupedField = (props: Props) => {
  const { field, fields } = props;
  const [subFieldIds, setSubFieldIds] = React.useState<string[]>(
    field?.subFieldIds || []
  );

  if (props.fields && props.fields.length === 0) {
    return <p>There are no fields yet.</p>;
  }

  React.useEffect(() => {
    if (props.field) {
      setSubFieldIds(props.field.subFieldIds || []);
    }
  }, [props.field]);

  return (
    <FormGroup>
      <ControlLabel>Fields</ControlLabel>
      <p>{__('Please select a subfields')}</p>
      <Select
        placeholder={__('Choose')}
        options={fields.map(f => ({ label: f.text, value: f._id }))}
        onChange={(values: any) => {
          props.onChange({
            ...field,
            subFieldIds: values.map(v => v.value)
          });
        }}
        clearable={true}
        value={subFieldIds}
        multi={true}
      />
    </FormGroup>
  );
};

export default GroupedField;
