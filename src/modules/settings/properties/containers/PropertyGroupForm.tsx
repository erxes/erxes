import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PropertyGroupForm } from '../components';
import { mutations, queries } from '../graphql';
import {
  FieldsGroupsAddMutationResponse,
  FieldsGroupsEditMutationResponse,
  FieldsGroupsMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = Props &
  FieldsGroupsAddMutationResponse &
  FieldsGroupsEditMutationResponse;

const PropertyGroupFormContainer = (props: FinalProps) => {
  const { fieldsGroupsAdd, fieldsGroupsEdit, queryParams } = props;

  const { type } = queryParams;

  const add = ({ doc }) => {
    fieldsGroupsAdd({
      variables: {
        ...doc,
        contentType: type
      }
    })
      .then(() => {
        Alert.success('You successfully added a new property group');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const edit = ({ _id, doc }) => {
    fieldsGroupsEdit({
      variables: {
        _id,
        ...doc
      }
    })
      .then(() => {
        Alert.success('You successfully updated a property group');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    add,
    edit
  };

  return <PropertyGroupForm {...updatedProps} />;
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
    graphql<
      Props,
      FieldsGroupsAddMutationResponse,
      FieldsGroupsMutationVariables
    >(gql(mutations.fieldsGroupsAdd), {
      name: 'fieldsGroupsAdd',
      options
    }),
    graphql<
      Props,
      FieldsGroupsEditMutationResponse,
      FieldsGroupsMutationVariables
    >(gql(mutations.fieldsGroupsEdit), {
      name: 'fieldsGroupsEdit',
      options
    })
  )(PropertyGroupFormContainer)
);
