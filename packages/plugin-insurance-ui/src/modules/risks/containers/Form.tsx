import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import { getGqlString } from '@erxes/ui/src/utils/core';
import RiskForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { Risk } from '../../../gql/types';

type Props = {
  risk?: Risk;
  refetch?: () => void;
  closeModal: () => void;
};

const RiskFormContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={getGqlString(
          props.risk ? mutations.RISKS_EDIT : mutations.RISKS_ADD
        )}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a risk`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <RiskForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: queries.RISKS_PAGINATED
    }
  ];
};

export default RiskFormContainer;
