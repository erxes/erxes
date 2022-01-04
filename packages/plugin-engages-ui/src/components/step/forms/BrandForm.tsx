import { IButtonMutateProps } from '@erxes/ui/src/types';
// import { StepFormWrapper } from '../../../styles';
// import BrandForm from '@erxes/ui/src/settings/brands/components/BrandForm';
import React from 'react';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave: () => void;
};

const Form = ({ renderButton, afterSave }: Props) => {
  return (
    <div>brand</div>
    // <StepFormWrapper>
    //   <BrandForm
    //     afterSave={afterSave}
    //     modal={false}
    //     renderButton={renderButton}
    //   />
    // </StepFormWrapper>
  );
};

export default Form;
