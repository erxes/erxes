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
        icon="edit"
      />
      <FieldChoice
        {...props}
        type="textarea"
        text={__('Text area')}
        icon="alignleft"
      />
      <FieldChoice
        {...props}
        type="select"
        text={__('Select')}
        icon="clicker"
      />
      <FieldChoice {...props} type="check" text={__('Checkbox')} icon="check" />
      <FieldChoice
        {...props}
        type="radio"
        text={__('Radio button')}
        icon="checked"
      />
      <FieldChoice {...props} type="file" text={__('File')} icon="file" />
      <FieldChoice
        {...props}
        type="phone"
        text={__('Phone')}
        icon="phonecall-3"
      />
      <FieldChoice {...props} type="email" text={__('Email')} icon="email-1" />
      <FieldChoice
        {...props}
        type="firstName"
        text={__('First name')}
        icon="user-3"
      />
      <FieldChoice
        {...props}
        type="lastName"
        text={__('Last name')}
        icon="user-4"
      />
    </Options>
  );
}

export default FieldChoices;
