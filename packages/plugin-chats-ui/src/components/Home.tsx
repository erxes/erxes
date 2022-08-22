import React from 'react';
import queryString from 'query-string';
import Sidebar from '../containers/Sidebar';
import ChatDetail from '../containers/ChatDetail';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

type Props = {
  queryParams: any;
  location: any;
};

export default function Home(props: Props) {
  const { userIds, userId } = props.queryParams || {};
  const { _id } = queryString.parse(props.location.search);

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
      hasBorder
    />
  );
}
