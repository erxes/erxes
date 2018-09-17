import { AppConsumer, AppProvider } from 'appContext';
import * as React from 'react';
import { IUser } from '../../auth/types';
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