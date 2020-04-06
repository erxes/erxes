import { AppConsumer } from 'appContext';
import React from 'react';
import { can } from '../utils';

type Props = {
  action: string;
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
};

const WithPermission = (props: Props) => {
  const { action, children, fallbackComponent } = props;

  return (
    <AppConsumer>
      {({ currentUser }) => {
        if (!currentUser) {
          return fallbackComponent || null;
        }

        if (!can(action, currentUser)) {
          return fallbackComponent || null;
        }

        return children;
      }}
    </AppConsumer>
  );
};

export default WithPermission;
