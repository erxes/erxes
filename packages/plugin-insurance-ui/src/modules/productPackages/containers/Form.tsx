import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import { getGqlString } from '@erxes/ui/src/utils/core';

import RiskForm from '../components/Form';
import graphql from '../graphql';
import { InsurancePackage } from '../../../gql/types';

type Props = {
  insurancePackage?: InsurancePackage;
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
          props.insurancePackage
            ? graphql.mutations.EDIT_PACKAGE
            : graphql.mutations.ADD_PACKAGE
        )}
        variables={{ input: values, _id: object ? object._id : '' }}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          props.insurancePackage ? 'updated' : 'added'
        } a package`}
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
      query: graphql.queries.GET_PACKAGE_LIST
    }
  ];
};

export default RiskFormContainer;
