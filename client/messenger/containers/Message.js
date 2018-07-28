import * as React from 'react';
import { connection } from '../connection';
import { Message } from '../components';

const container = (props) => {
  return (
    <Message
      {...props}
      color={connection.data.uiOptions && connection.data.uiOptions.color}
    />
  );
};

export default container;
