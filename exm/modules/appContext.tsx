import React, { createContext } from "react";
import { gql, useQuery } from "@apollo/client";

import { CurrentUserQueryResponse } from "./auth/types";
import Spinner from "./common/Spinner";
import queries from "./auth/graphql/queries";

const AppContext = createContext({});

export const AppConsumer = AppContext.Consumer;

type Props = {
  children: any;
};

function AppProvider({ children }: Props) {
  const { data, loading } = useQuery<CurrentUserQueryResponse>(
    gql(queries.currentUser),
    {
      fetchPolicy: "network-only",
    }
  );

  if (loading) {
    return <Spinner />;
  }

  const currentUser = data?.currentUser || null;

  return (
    <AppContext.Provider
      value={{
        currentUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;
