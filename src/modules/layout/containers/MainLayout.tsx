import { AppConsumer, AppProvider } from 'appContext';
import { IUser } from 'modules/auth/types';
import * as React from 'react';
import { MainLayout } from '../components';

type Props = {
  currentUser?: IUser;
  children: React.ReactNode;
}

const container = (props: Props) => (
  <AppProvider currentUser={props.currentUser}>
    <AppConsumer>
      {() => <MainLayout {...props} />}
    </AppConsumer>
  </AppProvider>
);

export default container;