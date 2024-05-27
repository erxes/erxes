import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import React from 'react';

import TopupForm from '../../components/topup/Form';
import { mutations, queries } from '../../graphql';

type Props = {
  closeModal: () => void;
};

const TopupFormContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.manualTopup}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={'You successfully added a place'}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <TopupForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.topupList)
    }
  ];
};

export default TopupFormContainer;
