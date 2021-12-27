import { IButtonMutateProps } from 'erxes-ui/lib/types';
import { StepFormWrapper } from '../../../styles';
import React from 'react';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave: () => void;
};

const Form = ({}: Props) => {
  return (
    <StepFormWrapper>
      <div>brand</div>
    </StepFormWrapper>
  );
};

export default Form;
