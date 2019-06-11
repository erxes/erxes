import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PropertyForm } from '../components';
import { queries } from '../graphql';
import {
  FieldsAddMutationResponse,
  FieldsEditMutationResponse,
  FieldsGroupsQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props &
  FieldsAddMutationResponse &
  FieldsEditMutationResponse;

const PropertyFormContainer = (props: FinalProps) => {
  const { fieldsGroupsQuery, queryParams } = props;
  const { type } = queryParams;

  const updatedProps = {
    ...props,
    type,
    groups: fieldsGroupsQuery.fieldsGroups,
    refetchQueries: getRefetchQueries(queryParams)
  };

  return <PropertyForm {...updatedProps} />;
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
  )(PropertyFormContainer)
);
