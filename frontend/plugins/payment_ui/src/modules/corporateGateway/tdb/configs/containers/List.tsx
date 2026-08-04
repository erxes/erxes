import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import * as queries from '../../configs/graphql/queries';
import * as mutations from '../../configs/graphql/mutations';
import List from '../components/List';

const ListContainer = () => {
  const { data, loading, refetch } = useQuery(queries.configs, {
    variables: { perPage: 100 },
  });

  const [removeConfig] = useMutation(mutations.removeConfig, {
    refetchQueries: [{ query: queries.configs }],
  });
  const [addConfig] = useMutation(mutations.addConfig);
  const [editConfig] = useMutation(mutations.editConfig);

  const remove = (id: string) => {
    if (window.confirm('Are you sure?')) {
      removeConfig({ variables: { _id: id } })
        .then(() => window.alert('Deleted'))
        .catch((e) => window.alert(e.message));
    }
  };

  const add = (doc: any) => {
    addConfig({ variables: doc })
      .then(() => window.alert('Added'))
      .catch((e) => window.alert(e.message));
  };

  const edit = (id: string, doc: any) => {
    editConfig({ variables: { _id: id, ...doc } })
      .then(() => window.alert('Updated'))
      .catch((e) => window.alert(e.message));
  };

  const configs = data?.tdbConfigs || [];

  return (
    <List
      configs={configs}
      totalCount={configs.length}
      loading={loading}
      remove={remove}
      refetch={refetch}
      addConfig={add}
      editConfig={edit}
    />
  );
};

export default ListContainer;
