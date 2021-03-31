import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import { FieldWrapper, Options } from '../styles';

type Props = {
  onChoiceClick: (choice: string) => void;
};

type FieldProps = {
  icon: string;
  type: string;
  text: string;
};

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
  return (
    <Options>
      <FieldChoice
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
        type="firstName"
        text={__('First name')}
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
        type="companyName"
        text={__('Company name')}
        icon="building"
      />
      <FieldChoice
        {...props}
        type="companyEmail"
        text={__('Company Email')}
        icon="envelope-alt"
      />
      <FieldChoice
        {...props}
        type="companyPhone"
        text={__('Company Phone')}
        icon="phone"
      />
      <FieldChoice {...props} type="html" text={__('HTML')} icon="code" />
    </Options>
  );
}

export default FieldChoices;
