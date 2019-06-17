import { IButtonMutateProps } from 'modules/common/types';
import { StepFormWrapper } from 'modules/engage/styles';
import { Form as TagForm } from 'modules/tags/components';
import * as React from 'react';

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
        // afterSave={afterSave}
        // modal={false}
      />
    </StepFormWrapper>
  );
};

export default Form;
