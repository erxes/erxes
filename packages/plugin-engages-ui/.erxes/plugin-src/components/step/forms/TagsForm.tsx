import { IButtonMutateProps } from '@erxes/ui/src/types';
import { StepFormWrapper } from '../../../styles';
// import TagForm from '@erxes/ui/src/tags/components/Form';
import { ITag } from '@erxes/ui/src/tags/types';
import React from 'react';

type Props = {
  tags?: ITag[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave: () => void;
};

const Form = ({ renderButton, afterSave, tags }: Props) => {
  return (
    <StepFormWrapper>
      <div>tag form</div>
      {/* <TagForm
        type="customer"
        renderButton={renderButton}
        afterSave={afterSave}
        tags={tags || []}
      /> */}
    </StepFormWrapper>
  );
};

export default Form;
