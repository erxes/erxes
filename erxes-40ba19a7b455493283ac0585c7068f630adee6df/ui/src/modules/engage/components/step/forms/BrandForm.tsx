import { IButtonMutateProps } from 'modules/common/types';
import { StepFormWrapper } from 'modules/engage/styles';
import BrandForm from 'modules/settings/brands/components/BrandForm';
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
