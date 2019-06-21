import gql from 'graphql-tag';
import { ButtonMutate } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { PropertyGroupForm } from '../components';
import { mutations, queries } from '../graphql';
import {
  FieldsGroupsEditMutationResponse,
  FieldsGroupsMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  closeModal: () => void;
};

const PropertyGroupFormContainer = (props: Props) => {
  const { queryParams } = props;
  const { type } = queryParams;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={
          object ? mutations.fieldsGroupsEdit : mutations.fieldsGroupsAdd
        }
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(queryParams)}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    type,
    renderButton
  };

  return <PropertyGroupForm {...updatedProps} />;
};

const getRefetchQueries = queryParams => {
  return [
    {
      query: gql(queries.fieldsGroups),
      variables: { contentType: queryParams.type }
    }
  ];
};

export default PropertyGroupFormContainer;
