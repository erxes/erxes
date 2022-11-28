import { FieldWrapper } from '@erxes/ui-forms/src/forms/styles';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';

type Props = {
  onChoiceClick: (choice: string) => void;
};

const FieldChoice = (props: Props) => {
  const onClick = () => {
    props.onChoiceClick('productCategory');
  };

  return (
    <FieldWrapper onClick={onClick}>
      <Icon icon={'shoppingcart'} size={25} />
      Product/Service
    </FieldWrapper>
  );
};

export default FieldChoice;
