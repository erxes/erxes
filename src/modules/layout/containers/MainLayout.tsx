import { AppConsumer, AppProvider } from 'AppContext';
import * as React from 'react';
import { MainLayout } from '../components';

type Props = {
  children: React.ReactNode,
}

const container = (props: Props) => (
  <AppProvider>
    <AppConsumer>
      {({ currentUser }) => (
        <MainLayout
          {...props}
          currentUser={currentUser}
        />
      )}
    </AppConsumer>
  </AppProvider>
);

export default container;
