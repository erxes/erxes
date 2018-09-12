import { AppConsumer, AppProvider } from 'AppContext';
import * as React from 'react';
import { AuthLayout } from '../components';

type Props = {
  content: React.ReactNode,
}

const container = (props: Props) => (
  <AppProvider>
    <AppConsumer>
      {({ currentUser }) => (
        <AuthLayout
          {...props}
          currentUser={currentUser}
        />
      )}
    </AppConsumer>
  </AppProvider>
);

export default container;
