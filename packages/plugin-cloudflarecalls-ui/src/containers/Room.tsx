import React from 'react';
import { RoomProvider } from '../RoomProvider';
import CallProvider from './CallProvider';
const Room = (props) => {
  return (
    <RoomProvider>
      <CallProvider {...props} />
    </RoomProvider>
  );
};

export default Room;
