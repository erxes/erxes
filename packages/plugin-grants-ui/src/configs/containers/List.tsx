import React from 'react';
import { gql } from '@apollo/client';
import { mutations, queries } from '../graphql';
import { Spinner, confirm } from '@erxes/ui/src';
import List from '../components/List';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  queryParams: any;
};

const ConfigsList: React.FC<Props> = (props) => {
  const listQueryResponse = useQuery(gql(queries.configs));

  const [removeConfig] = useMutation(gql(mutations.removeConfig), {
    refetchQueries: refetchQueries(),
  });

  if (listQueryResponse.loading) {
    return <Spinner />;
  }

  const remove = (variables) => {
    confirm().then(() => {
      removeConfig({ variables });
    });
  };

  const updatedProps = {
    remove,
    configs: listQueryResponse.data && listQueryResponse.data.grantConfigs,
    totalCount:
      listQueryResponse.data && listQueryResponse.data.grantConfigsTotalCount,
  };

  return <List {...updatedProps} />;
};

export const refetchQueries = () => {
  return [{ query: gql(queries.configs) }];
};

export default ConfigsList;
