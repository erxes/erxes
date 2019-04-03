import { AppConsumer } from 'appContext';
import * as React from 'react';

type Props = {
  action: string;
  children: React.ReactNode;
};

const WithPermission = (props: Props) => {
  const { action, children } = props;

  return (
    <AppConsumer>
      {({ can }) => {
        if (!can(action)) {
          return null;
        }

        return children;
      }}
    </AppConsumer>
  );
};

export default WithPermission;
