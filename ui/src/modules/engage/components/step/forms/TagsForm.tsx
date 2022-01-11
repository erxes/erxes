import { IButtonMutateProps } from 'modules/common/types';
import { StepFormWrapper } from 'modules/engage/styles';
import TagForm from 'modules/tags/components/Form';
import { ITag } from 'modules/tags/types';
import React from 'react';

type Props = {
  tags?: ITag[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave: () => void;
};

const Form = ({ renderButton, afterSave, tags }: Props) => {
  return (
    <StepFormWrapper>
      <TagForm
        type="customer"
        renderButton={renderButton}
        afterSave={afterSave}
        tags={tags || []}
      />
    </StepFormWrapper>
  );
};

export default Form;
