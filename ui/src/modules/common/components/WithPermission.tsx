import { AppConsumer } from 'appContext';
import React from 'react';
import { can } from '../utils';

type Props = {
  action: string;
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  actions?: string[];
};

const WithPermission = (props: Props) => {
  const { action, actions, children, fallbackComponent } = props;

  return (
    <AppConsumer>
      {({ currentUser }) => {
        if (!currentUser) {
          return fallbackComponent || null;
        }

        // check when an action is possible through multiple permissions
        if (actions && actions.length > 0) {
          for (const a of actions) {
            if (can(a, currentUser)) {
              return children;
            }
          }
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
