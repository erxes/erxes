import React from 'react';
import { RoomProvider } from '../RoomProvider';
import SipProviderContainer from './SipProvider';
const Room = (props) => {
  return (
    <RoomProvider>
      <SipProviderContainer {...props} />
    </RoomProvider>
  );
};

export default Room;
