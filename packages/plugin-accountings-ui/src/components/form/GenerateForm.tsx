import React, { useState } from 'react';
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

export interface IField {
  label: string;
  name: string;
  validate: (v: string) => boolean;
  type: 'date' | 'input' | 'checkbox' | 'number' | 'select' | 'custom';
}

interface IProps {
  fields: IField[] | [IField[]];
  renderButton: (props) => JSX.Element;
  closeModal: () => void;
}

function renderFormFields(fields: IField[] | [IField[]],values,onChange,formProps) {
  if (Array.isArray(fields[0]))
    return fields.map((columns) => {
      return (
        <FormColumn>
          {columns.map((row) => {
            return <FieldsGenerate formProps={formProps} value={values[row.key]} onChange={onChange} {...row} />;
          })}
        </FormColumn>
      );
    });
  else
    return (
      <FormColumn>
        {fields.map((row) => {
          return <FieldsGenerate formProps={formProps} value={values[row.key]} onChange={onChange} {...row} />;
        })}
      </FormColumn>
    );
}

function GenerateForm({ fields, renderButton, closeModal }: IProps) {
  const [formValue, setFormValue] = useState<object>({});

  const renderContent = (formProps: IFormProps): React.ReactNode => {
    const { values, isSubmitted, resetSubmit } = formProps;

    const onChange= (value,key) =>{
      setFormValue(v=>{
        return {...v,[key]:value}
      })
    }

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>{renderFormFields(fields,values,onChange,formProps)}</FormWrapper>
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
            values: formValue,
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
