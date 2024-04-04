import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { AppConsumer, AppProvider } from 'appContext';
import { IUser } from 'modules/auth/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import MainLayout from '../components/MainLayout';

type Props = {
  currentUser?: IUser;
  plugins?: any;
  children: React.ReactNode;
};

type FinalProps = {
  enabledServicesQuery: any;
} & Props;

const MainLayoutContainer = (props: FinalProps) => {
  const { currentUser, plugins, enabledServicesQuery } = props;

  if (enabledServicesQuery.loading) {
    return null;
  }

  const enabledServices = enabledServicesQuery.enabledServices || {};
  return (
    <AppProvider currentUser={currentUser} plugins={plugins}>
      <AppConsumer>
        {({ isShownIndicator, closeLoadingBar }) => {
          return (
            <MainLayout
              {...props}
              enabledServices={enabledServices}
              isShownIndicator={isShownIndicator}
              closeLoadingBar={closeLoadingBar}
            />
          );
        }}
      </AppConsumer>
    </AppProvider>
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, {}, {}>(
      gql(`query enabledServices {
          enabledServices
        }`),
      {
        name: 'enabledServicesQuery'
      }
    )
  )<FinalProps>(MainLayoutContainer)
);
