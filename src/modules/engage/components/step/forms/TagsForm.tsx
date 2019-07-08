import { IButtonMutateProps } from 'modules/common/types';
import { StepFormWrapper } from 'modules/engage/styles';
import TagForm from 'modules/tags/components/Form';
import React from 'react';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave: () => void;
};

const Form = ({ renderButton, afterSave }: Props) => {
  return (
    <StepFormWrapper>
      <TagForm
        type="customer"
        renderButton={renderButton}
        afterSave={afterSave}
      />
    </StepFormWrapper>
  );
};

export default Form;
