import { IButtonMutateProps } from '@erxes/ui/src/types';
import { StepFormWrapper } from '@erxes/ui-engage/src/styles';
import BrandForm from '@erxes/ui/src/brands/components/BrandForm';
import React from 'react';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave: () => void;
};

const Form = ({ renderButton, afterSave }: Props) => {
  return (
    <StepFormWrapper>
      <BrandForm
        afterSave={afterSave}
        modal={false}
        renderButton={renderButton}
      />
    </StepFormWrapper>
  );
};

export default Form;
