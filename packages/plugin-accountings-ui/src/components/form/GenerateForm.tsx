import React, { useMemo, useState } from 'react';
import Form from '@erxes/ui/src/components/form/Form';
import {
  FormColumn,
  FormWrapper,
  ScrollWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import FieldsGenerate from './FieldsGenerate';
import { IFormProps } from '@erxes/ui/src/types';

const renderColumn = (fields, values, onChange, formProps) => {
  return (
    <FormColumn>
      {fields.map((row) => {
        return (
          <FieldsGenerate
            key={row.name}
            formProps={formProps}
            value={values[row.name]}
            onChange={onChange}
            {...row}
          />
        );
      })}
    </FormColumn>
  );
};

export interface IField {
  label: string;
  name: string;
  validate?: (v: string) => boolean;
  type:
    | 'date'
    | 'input'
    | 'checkbox'
    | 'number'
    | 'select'
    | 'custom'
    | 'selectWithSearch';
  required?: boolean;
  controlProps?: any;
  selectProps?: {
    filterParams: any;
    multi: boolean;
    queryName: string;
    generateOptions: Function;
    customQuery: string;
  };
  customField?: any;
}

interface IProps {
  defaultValue?: any;
  fields: IField[] | IField[][];
  renderButton: (props) => JSX.Element;
  closeModal: () => void;
}

function renderFormFields(
  fields: IField[] | IField[][],
  values,
  onChange,
  formProps
) {
  if (Array.isArray(fields[0])) {
    return fields.map((columns) => {
      return renderColumn(columns, values, onChange, formProps);
    });
  } else {
    return renderColumn(fields, values, onChange, formProps);
  }
}

function GenerateForm({
  fields,
  renderButton,
  closeModal,
  defaultValue
}: IProps) {
  const [formValue, setFormValue] = useState<object>(defaultValue || {});
  const values = useMemo(() => {
    return { id: defaultValue?._id, ...formValue };
  }, [formValue]);
  const renderContent = (formProps: IFormProps): React.ReactNode => {
    const { isSubmitted, resetSubmit } = formProps;

    const onChange = (value, key) => {
      setFormValue((v) => {
        return { ...v, [key]: value };
      });
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            {renderFormFields(fields, formValue, onChange, formProps)}
          </FormWrapper>
        </ScrollWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            uppercase={false}
            onClick={closeModal}
            icon="times-circle"
          >
            Close
          </Button>

          {renderButton({
            values: values,
            isSubmitted,
            resetSubmit
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
}

export default GenerateForm;
