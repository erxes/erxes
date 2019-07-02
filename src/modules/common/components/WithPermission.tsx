import { AppConsumer } from 'appContext';
import React from 'react';
import { can } from '../utils';

type Props = {
  action: string;
  children: React.ReactNode;
};

const WithPermission = (props: Props) => {
  const { action, children } = props;

  return (
    <AppConsumer>
      {({ currentUser }) => {
        if (!currentUser) {
          return null;
        }

        if (!can(action, currentUser)) {
          return null;
        }

        return children;
      }}
    </AppConsumer>
  );
};

export default WithPermission;
