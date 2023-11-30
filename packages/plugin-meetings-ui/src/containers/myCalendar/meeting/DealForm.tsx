import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { mutations } from '../../../graphql';
import { DealForm } from '../../../components/myCalendar/meeting/DealForm';

type Props = {
  closeModal: () => void;
  stageId: string;
};

const DealFormContainer = (props: Props) => {
  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.addDeal}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${passedName}`}
        refetchQueries={['deals']}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <DealForm {...updatedProps} />;
};

export default DealFormContainer;
