import { DateContainer } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';

export type IOption = {
  label: string;
  value: string;
  avatar?: string;
  extraValue?: string;
};

interface ISelectProps {
  customQuery?: string;
  queryName?: string;
  generateOptions: (datas: any[]) => IOption[];
  customOption?: {
    value: string;
    label: string;
    avatar?: string;
  };
  multi: boolean;
  filterParams?: any;
}

interface IProps {
  label: string;
  name: string;
  type:
    | 'date'
    | 'input'
    | 'checkbox'
    | 'number'
    | 'select'
    | 'custom'
    | 'selectWithSearch';
  onChange: Function;
  value: any;
  validate?: Function;
  controlProps?: any;
  required?: boolean;
  selectProps?: ISelectProps;
  customField?: (props: IProps) => any;
  formProps?: any;
}

function FieldsGenerate(props: IProps) {
  const {
    type,
    onChange,
    value,
    label,
    controlProps,
    required,
    name,
    selectProps,
    customField,
    formProps
  } = props;

  console.log('value',value)

  if (type === 'date') {
    return (
      <FormGroup>
        <ControlLabel required={required}>{label}</ControlLabel>
        <DateContainer>
          <DateControl
            {...formProps}
            required={required}
            value={value}
            onChange={(v) => onChange(v, name)}
            name={name}
            {...controlProps}
          />
        </DateContainer>
      </FormGroup>
    );
  }
  if (type === 'checkbox') {
    return (
      <FormGroup>
        <FormControl
          {...formProps}
          required={required}
          type="checkbox"
          componentclass="checkbox"
          checked={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.checked, name)
          }
          name={name}
          {...controlProps}
        />
        <ControlLabel required={required}>{label}</ControlLabel>
      </FormGroup>
    );
  }

  if (type === 'selectWithSearch') {
    return (
      <FormGroup>
        <ControlLabel required={required}>{label}</ControlLabel>
        <SelectWithSearch
          required={required}
          label={label}
          queryName={selectProps?.queryName || ''}
          name={name}
          initialValue={value}
          generateOptions={selectProps?.generateOptions}
          onSelect={(v) => onChange(v, name)}
          customQuery={selectProps?.customQuery}
          multi={selectProps?.multi}
          filterParams={selectProps?.filterParams}
        />
      </FormGroup>
    );
  }

  if (type === 'select') {
    return (
      <FormGroup>
        <ControlLabel required={required}>{label}</ControlLabel>
        <FormControl
          {...formProps}
          required={required}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value, name)
          }
          name={name}
          type={'select'}
          componentclass="select"
          {...controlProps}
        />
      </FormGroup>
    );
  }

  if (type === 'number') {
    return (
      <FormGroup>
        <ControlLabel required={required}>{label}</ControlLabel>
        <FormControl
          {...formProps}
          required={required}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value, name)
          }
          name={name}
          type={'number'}
          useNumberFormat
          {...controlProps}
        />
      </FormGroup>
    );
  }

  if (type === 'custom') {
    return (
      <FormGroup>
        <ControlLabel required={required}>{label}</ControlLabel>
        {customField && customField(props)}
      </FormGroup>
    );
  }

  return (
    <FormGroup>
      <ControlLabel required={required}>{label}</ControlLabel>
      <FormControl
        required={required}
        {...formProps}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value, name)
        }
        name={name}
        {...controlProps}
      />
    </FormGroup>
  );
}

export default FieldsGenerate;
