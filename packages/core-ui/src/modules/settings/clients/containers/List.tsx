import { gql, useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { router } from '@erxes/ui/src/utils';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, confirm } from '@erxes/ui/src/utils';
import ClientList from '../components/List';

const QUERY = gql`
  query ClientList($page: Int, $perPage: Int, $searchValue: String) {
    clientList(page: $page, perPage: $perPage, searchValue: $searchValue) {
      list {
        _id
        clientId
        clientSecret
        name
        createdAt
      }
    }
  }
`;

const DELETE = gql`
  mutation ClientsRemove($id: String!) {
    clientsRemove(_id: $id)
  }
`;

type Props = { queryParams: any };

const List = (props: Props) => {
  
  const { queryParams } = props;

  const { data, loading, refetch } = useQuery(QUERY, {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      searchValue: queryParams.searchValue,
    },
  });
  

  const [deleteMutation] = useMutation(DELETE);

  const removeClient = (id: string) => {
    const message = 'Are you sure want to remove this app ?';

    confirm(message).then(() => {
      deleteMutation({
        variables: { id },
      })
        .then(() => {
          refetch();

          Alert.success('You successfully deleted an app.');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  if (loading) {
    return <Spinner />;
  }

  const clients = data?.clientList?.list || [];
  const totalCount = data?.clientList?.totalCount || 0;

  const extendedProps = {
    ...props,
    clients,
    totalCount,
    page: queryParams.page || 1,
    perPage: queryParams.perPage || 20,
    loading,
    remove: removeClient,
    refetch,
  };

  return <ClientList {...extendedProps} />;
};

export default List;
