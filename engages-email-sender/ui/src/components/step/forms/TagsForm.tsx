import { IButtonMutateProps } from 'erxes-ui/lib/types';
import { StepFormWrapper } from '../../../styles';
import React from 'react';

type Props = {
  tags?: any[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave: () => void;
};

const Form = ({ renderButton, afterSave, tags }: Props) => {
  return (
    <StepFormWrapper>
      <div />
    </StepFormWrapper>
  );
};

export default Form;
