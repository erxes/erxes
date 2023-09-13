import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
// erxes
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Spinner from '@erxes/ui/src/components/Spinner';
// local
import Component from '../components/RightSidebar';
import { queries } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';

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
    Alert.error(error.message);
  }

  if (data.chatDetail) {
    return <Component chatDetail={data.chatDetail} />;
  }

  return null;
};

export default RightSidebarContainer;
