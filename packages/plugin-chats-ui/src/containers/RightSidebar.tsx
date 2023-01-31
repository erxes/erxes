import React, { useEffect } from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Spinner from '@erxes/ui/src/components/Spinner';
// local
import Component from '../components/RightSidebar';
import { queries } from '../graphql';

type Props = {
  chatId: string;
};

const RightSidebarContainer = (props: Props) => {
  const { chatId } = props;

  const { loading, error, data, refetch } = useQuery(gql(queries.chatDetail), {
    variables: { id: chatId }
  });

  useEffect(() => {
    refetch();
  }, [chatId]);

  if (loading) {
    return (
      <Sidebar wide={true}>
        <Spinner />
      </Sidebar>
    );
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  if (data.chatDetail) {
    return <Component chatDetail={data.chatDetail} />;
  }

  return <></>;
};

export default RightSidebarContainer;
