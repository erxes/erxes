import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { FieldWrapper, Options } from '../styles';
import FormField from './FormField';

type Props = {
  editingField?: IField;
  onChange: (value: IField, callback: () => void) => void;
  onSubmit: (e: any) => void;
};

type FieldProps = {
  icon: string;
  type: string;
  text: string;
};

function Field(props: Props & FieldProps) {
  const { onChange, onSubmit, editingField, icon, type, text } = props;

  const trigger = (
    <FieldWrapper>
      <Icon icon={icon} size={25} />
      {text || type}
    </FieldWrapper>
  );

  const content = modalProps => (
    <FormField
      {...modalProps}
      type={type}
      onSubmit={onSubmit}
      onChange={onChange}
      editingField={editingField}
    />
  );

  return (
    <ModalTrigger
      title={`Add ${type} field`}
      size="lg"
      trigger={trigger}
      content={content}
    />
  );
}

function FormFields(props: Props) {
  return (
    <Options>
      <Field {...props} type="input" text={__('Text input')} icon="edit" />
      <Field
        {...props}
        type="textarea"
        text={__('Text area')}
        icon="alignleft"
      />
      <Field {...props} type="select" text={__('Select')} icon="clicker" />
      <Field {...props} type="check" text={__('Checkbox')} icon="check" />
      <Field {...props} type="radio" text={__('Radio button')} icon="checked" />
      <Field {...props} type="phone" text={__('Phone')} icon="phonecall-3" />
      <Field {...props} type="email" text={__('Email')} icon="email-1" />
      <Field
        {...props}
        type="firstName"
        text={__('First name')}
        icon="user-3"
      />
      <Field {...props} type="lastName" text={__('Last name')} icon="user-4" />
    </Options>
  );
}

export default FormFields;
