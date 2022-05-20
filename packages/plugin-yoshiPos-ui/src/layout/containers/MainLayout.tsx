import { AppConsumer, AppProvider } from '../../../appContext';
import { IUser } from '../../auth/types';
import React from 'react';
import MainLayout from '../components/MainLayout';
import { IConfig } from '../../types';

type Props = {
  posCurrentUser?: IUser;
  currentConfig?: IConfig;
  orientation: string;
  children: React.ReactNode;
};

const container = (props: Props) => (
  <AppProvider
    posCurrentUser={props.posCurrentUser}
    currentConfig={props.currentConfig}
  >
    <AppConsumer>{() => <MainLayout {...props} />}</AppConsumer>
  </AppProvider>
);

export default container;
