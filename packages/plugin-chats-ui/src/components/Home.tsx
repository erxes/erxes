import React from 'react';

import Sidebar from '../containers/Sidebar';
import ChatDetail from '../containers/ChatDetail';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

type Props = {
  queryParams: any;
};

export default function Home(props: Props) {
  const { _id, userIds, userId } = props.queryParams || {};

  const renderContent = () => {
    return <ChatDetail chatId={_id} userIds={userId ? [userId] : userIds} />;
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
