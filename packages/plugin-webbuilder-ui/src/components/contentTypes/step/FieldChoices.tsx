import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { FieldWrapper, Options } from '@erxes/ui-forms/src/forms/styles';

type Props = {
  type: string;
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

      <FieldChoice {...props} type="file" text={__('File')} icon="paperclip" />
    </Options>
  );
}

export default FieldChoices;
