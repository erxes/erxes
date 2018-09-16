import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PropertyGroupForm } from '../components';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any,
  fieldsGroupsAdd: (fieldsAdd: { variables: { contentType: string } }) => any,
  fieldsGroupsEdit: (fieldsEdit: { variables: { contentType: string } }) => any,
  closeModal: () => void,
};

const PropertyGroupFormContainer = (props: Props) => {
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
        Alert.success('Successfully added');
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
        Alert.success('Successfully Edited');
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
      query: gql`${queries.fieldsGroups}`,
      variables: { contentType: queryParams.type }
    }
  ]
});

export default compose(
  graphql(gql(mutations.fieldsGroupsAdd), {
    name: 'fieldsGroupsAdd',
    options
  }),
  graphql(gql(mutations.fieldsGroupsEdit), {
    name: 'fieldsGroupsEdit',
    options
  })
)(PropertyGroupFormContainer);
