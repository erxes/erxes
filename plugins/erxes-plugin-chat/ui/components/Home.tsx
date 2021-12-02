import React from 'react';
import { Wrapper } from 'erxes-ui';
import Sidebar from '../containers/Sidebar';
import ChatDetail from '../containers/ChatDetail';

type Props = {
  queryParams: any;
};

export default function Home(props: Props) {
  const { _id, userIds } = props.queryParams || {};

  const renderContent = () => {
    return <ChatDetail chatId={_id} userIds={userIds} />;
  };

  return (
    <Wrapper
      transparent={true}
      header={
        <Wrapper.Header title={'Chat'} breadcrumb={[{ title: 'Chat' }]} />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
    />
  );
}
