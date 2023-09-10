import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import PropertyGroupForm from '../components/PropertyGroupForm';
import { mutations, queries } from '../graphql';
import { FieldsGroupsQueryResponse } from '../types';

type Props = {
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props;

const PropertyGroupFormContainer = (props: FinalProps) => {
  const { fieldsGroupsQuery, queryParams } = props;
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
    groups: fieldsGroupsQuery.fieldsGroups,
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

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(queries.fieldsGroups),
      {
        name: 'fieldsGroupsQuery',
        options: ({ queryParams }) => ({
          variables: {
            contentType: queryParams.type
          }
        })
      }
    )
  )(PropertyGroupFormContainer)
);
