import React from 'react';

import AppProvider, { AppConsumer } from '../../modules/appContext';
import Tasks from '../../modules/task/containers/Tasks';

export default function Category() {
  // return <Tasks />;

  return (
    <AppProvider>
      <AppConsumer>
        {({ currentUser }: any) => {
          return <Tasks currentUser={currentUser} />;
        }}
      </AppConsumer>
    </AppProvider>
  );
}
