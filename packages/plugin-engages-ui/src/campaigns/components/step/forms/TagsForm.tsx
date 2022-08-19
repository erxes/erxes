import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ITag } from '@erxes/ui-tags/src/types';
import React from 'react';
import { StepFormWrapper } from '@erxes/ui-engage/src/styles';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import TagForm from '@erxes/ui-tags/src/components/Form';

type Props = {
  tags?: ITag[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave: () => void;
};

const Form = ({ renderButton, afterSave, tags }: Props) => {
  return (
    <StepFormWrapper>
      <TagForm
        type={TAG_TYPES.CUSTOMER}
        renderButton={renderButton}
        afterSave={afterSave}
        tags={tags || []}
      />
    </StepFormWrapper>
  );
};

export default Form;
