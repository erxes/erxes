import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import * as queries from '../../configs/graphql/queries';
import * as mutations from '../../configs/graphql/mutations';
import ConfigsList from '../components/ConfigsList';

const ConfigsListContainer = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { data, loading, refetch } = useQuery(queries.configs, {
    variables: { perPage: 100 },
  });

  const [addConfig] = useMutation(mutations.addConfig);
  const [editConfig] = useMutation(mutations.editConfig);

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

  const params: any = {};
  queryParams.forEach((value, key) => { params[key] = value; });

  return (
    <ConfigsList
      configs={configs}
      totalCount={configs.length}
      queryParams={params}
      loading={loading}
      refetch={refetch}
      addConfig={add}
      editConfig={edit}
    />
  );
};

export default ConfigsListContainer;