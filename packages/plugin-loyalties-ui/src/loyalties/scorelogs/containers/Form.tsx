import { ButtonMutate } from '@erxes/ui/src';
import React from 'react';
import ScoreForm from '../components/Form';
import mutations from '../graphql/mutations';

type Props = {
  closeModal: () => void;
};

const Form = (props: Props) => {
  const renderButton = ({ values, isSubmitted, callback }) => {
    return (
      <ButtonMutate
        mutation={mutations.changeScore}
        variables={values}
        callback={callback}
        refetchQueries={['scoreLogList']}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <ScoreForm {...updatedProps} />;
};

export default Form;
