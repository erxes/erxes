import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PropertyForm } from '../components';
import { mutations, queries } from '../graphql';
import {
  FieldsAddMutationResponse,
  FieldsEditMutationResponse,
  FieldsGroupsQueryResponse,
  FieldsMutationVariables
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
  const { fieldsAdd, fieldsGroupsQuery, fieldsEdit, queryParams } = props;
  const { type } = queryParams;

  const add = ({ doc }) => {
    fieldsAdd({
      variables: {
        ...doc,
        contentType: type
      }
    })
      .then(() => {
        Alert.success('You successfully added a new property field');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const edit = ({ _id, doc }) => {
    fieldsEdit({
      variables: {
        _id,
        ...doc
      }
    })
      .then(() => {
        Alert.success('You successfully updated a new property field');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    add,
    edit,
    groups: fieldsGroupsQuery.fieldsGroups
  };

  return <PropertyForm {...updatedProps} />;
};

const options = ({ queryParams }) => ({
  refetchQueries: [
    {
      query: gql`
        ${queries.fieldsGroups}
      `,
      variables: { contentType: queryParams.type }
    }
  ]
});

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
    ),
    graphql<Props, FieldsAddMutationResponse, FieldsMutationVariables>(
      gql(mutations.fieldsAdd),
      {
        name: 'fieldsAdd',
        options
      }
    ),
    graphql<Props, FieldsEditMutationResponse, FieldsMutationVariables>(
      gql(mutations.fieldsEdit),
      {
        name: 'fieldsEdit',
        options
      }
    )
  )(PropertyFormContainer)
);
