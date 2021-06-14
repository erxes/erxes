import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import PropertyGroupForm from '../components/PropertyGroupForm';
import { mutations, queries } from '../graphql';

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
    values.contentType = queryParams.type;

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
        uppercase={false}
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    type,
    renderButton,
    selectedItems: []
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
