import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';
import React from 'react';
import { FieldWrapper, Options } from '../styles';
import ProductFieldChoise from '@erxes/ui-products/src/containers/form/FormFieldChoice';

type Props = {
  type: string;
  onChoiceClick: (choice: string) => void;
  fieldTypes?: string[];
};

type FieldProps = {
  icon: string;
  type: string;
  text: string;
};

let fieldChoices = [
  { type: 'input', text: 'Text input', icon: 'edit-alt' },
  { type: 'textarea', text: 'Text area', icon: 'paragraph' },
  { type: 'check', text: 'Checkbox', icon: 'check-square' },
  { type: 'radio', text: 'Radio button', icon: 'check-circle' },
  { type: 'select', text: 'Select', icon: 'sort-amount-down' },
  { type: 'file', text: 'File', icon: 'paperclip' },
  { type: 'email', text: 'Email', icon: 'envelope-alt' },
  { type: 'phone', text: 'Phone', icon: 'phone' },
  {
    type: 'internationalPhone',
    text: 'International Phone number',
    icon: 'phone',
  },
  { type: 'firstName', text: 'First name', icon: 'user-6' },
  { type: 'middleName', text: 'Middle name', icon: 'user-6' },
  { type: 'lastName', text: 'Last name', icon: 'user-6' },
  { type: 'company_primaryName', text: 'Company name', icon: 'building' },
  { type: 'company_primaryEmail', text: 'Company Email', icon: 'envelope-alt' },
  { type: 'company_primaryPhone', text: 'Company Phone', icon: 'phone' },
  { type: 'map', text: 'Location/Map', icon: 'map-marker' },
  { type: 'html', text: 'HTML', icon: 'code' },
  { type: 'objectList', text: 'Object List', icon: 'sort-amount-down' },
  { type: 'parentField', text: 'Group', icon: 'sort-amount-down' },
];

function FieldChoice(props: Props & FieldProps) {
  const { icon, type, text, onChoiceClick } = props;

  const onClick = () => {
    onChoiceClick(type);
  };

  return (
    <FieldWrapper onClick={onClick}>
      <Icon icon={icon} size={25} />
      {text || type}
    </FieldWrapper>
  );
}

function FieldChoices(props: Props) {
  if (!!props?.fieldTypes?.length) {
    fieldChoices = fieldChoices.filter(({ type }) =>
      (props?.fieldTypes || []).includes(type)
    );
  }

  return (
    <Options>
      {fieldChoices.map(({ type, text, icon }) => (
        <FieldChoice {...props} type={type} text={__(text)} icon={icon} />
      ))}
      {/* <FieldChoice
        {...props}
        type="input"
        text={__('Text input')}
        icon="edit-alt"
      />
      <FieldChoice
        {...props}
        type="textarea"
        text={__('Text area')}
        icon="paragraph"
      />
      <FieldChoice
        {...props}
        type="check"
        text={__('Checkbox')}
        icon="check-square"
      />
      <FieldChoice
        {...props}
        type="radio"
        text={__('Radio button')}
        icon="check-circle"
      />
      <FieldChoice
        {...props}
        type="select"
        text={__('Select')}
        icon="sort-amount-down"
      />
      <FieldChoice {...props} type="file" text={__('File')} icon="paperclip" />
      <FieldChoice
        {...props}
        type="email"
        text={__('Email')}
        icon="envelope-alt"
      />
      <FieldChoice {...props} type="phone" text={__('Phone')} icon="phone" />
      <FieldChoice
        {...props}
        type="internationalPhone"
        text={__('International Phone number')}
        icon="phone"
      />
      <FieldChoice
        {...props}
        type="firstName"
        text={__('First name')}
        icon="user-6"
      />
      <FieldChoice
        {...props}
        type="middleName"
        text={__('Middle name')}
        icon="user-6"
      />
      <FieldChoice
        {...props}
        type="lastName"
        text={__('Last name')}
        icon="user-6"
      />
      <FieldChoice
        {...props}
        type="company_primaryName"
        text={__('Company name')}
        icon="building"
      />
      <FieldChoice
        {...props}
        type="company_primaryEmail"
        text={__('Company Email')}
        icon="envelope-alt"
      />
      <FieldChoice
        {...props}
        type="company_primaryPhone"
        text={__('Company Phone')}
        icon="phone"
      />
      <FieldChoice
        {...props}
        type="map"
        text={__('Location/Map')}
        icon="map-marker"
      />
      <FieldChoice {...props} type="html" text={__('HTML')} icon="code" />
      <FieldChoice
        {...props}
        type="objectList"
        text={__('Object List')}
        icon="sort-amount-down"
      />
      <FieldChoice
        {...props}
        type="parentField"
        text={__('Group')}
        icon="sort-amount-down"
      /> */}
      <ProductFieldChoise {...props} />
    </Options>
  );
}

export default FieldChoices;
