import { AppConsumer, AppProvider } from "appContext";
import { gql, useQuery } from "@apollo/client";

import { IUser } from "modules/auth/types";
import MainLayout from "../components/MainLayout";
import React from "react";

type Props = {
  currentUser?: IUser;
  plugins?: any;
  children: React.ReactNode;
};

const GET_ENABLED_SERVICES = gql`
  query enabledServices {
    enabledServices
  }
`;

const MainLayoutContainer = (props: Props) => {
  const { currentUser, plugins } = props;

  const { loading, data } = useQuery(GET_ENABLED_SERVICES);

  if (loading) {
    return null;
  }

  const enabledServices = data?.enabledServices || {};

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

export default MainLayoutContainer;
