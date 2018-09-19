import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PropertyForm } from '../components';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
  fieldsGroupsQuery: any;
  fieldsAdd: (fieldsAdd: { variables: { contentType: string } }) => Promise<any>;
  fieldsEdit: (fieldsEdit: { variables: { contentType: string } }) => Promise<any>;
  closeModal: () => void;
};

const PropertyFormContainer = (props: Props) => {
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
        Alert.success('Successfully added');
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
        Alert.success('Successfully edited');
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
      query: gql`${queries.fieldsGroups}`,
      variables: { contentType: queryParams.type }
    }
  ]
});

export default compose(
  graphql(gql(queries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: ({ queryParams } : { queryParams: any }) => ({
      variables: {
        contentType: queryParams.type
      }
    })
  }),
  graphql(gql(mutations.fieldsAdd), {
    name: 'fieldsAdd',
    options
  }),
  graphql(gql(mutations.fieldsEdit), {
    name: 'fieldsEdit',
    options
  })
)(PropertyFormContainer);
