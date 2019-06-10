import { StepFormWrapper } from 'modules/engage/styles';
import { BrandForm } from 'modules/settings/brands/components';
import * as React from 'react';

type Props = {
  save: (params: { doc: { name: string; description: string } }) => void;
  afterSave: () => void;
};

const Form = ({ save, afterSave }: Props) => {
  return (
    <StepFormWrapper>
      <BrandForm save={save} afterSave={afterSave} modal={false} />
    </StepFormWrapper>
  );
};

export default Form;
