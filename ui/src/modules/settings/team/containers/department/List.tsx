import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import { Alert, confirm } from 'modules/common/utils';
import React from 'react';
import { useMutation, useQuery } from 'react-apollo';

import List from '../../components/department/List';
import { queries, mutations } from '../../graphql';

export default function ListContainer() {
  const listQuery = useQuery(gql(queries.departments));
  const [deleteMutation] = useMutation(gql(mutations.departmentsRemove));

  const deleteDepartment = (_id: string, callback: () => void) => {
    confirm().then(() => {
      deleteMutation({ variables: { _id } })
        .then(() => {
          callback();

          Alert.success('Successfully deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  if (listQuery.loading) {
    return <Spinner />;
  }

  return <List deleteDepartment={deleteDepartment} listQuery={listQuery} />;
}
