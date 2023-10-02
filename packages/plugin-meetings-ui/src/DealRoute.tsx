import React from 'react';
import MeetingList from './containers/deal/meetingList';

export default ({ id }: { id: string }) => {
  return <MeetingList dealId={id} />;
};
