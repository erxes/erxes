import { Config, IUser, Store } from "../../types";
import { gql, useQuery } from "@apollo/client";

import { AppConsumer } from "../../appContext";
import React from "react";
import Spinner from "../../common/Spinner";
import Task from "../components/Task";
import { queries } from "../graphql";

type Props = {
  currentUser: IUser;
  config: Config;
};

function TaskContainer({ currentUser, ...props }: Props) {
  const { loading, data = {} as any } = useQuery(
    gql(queries.clientPortalTasks),
    {
      skip: !currentUser,
      fetchPolicy: "network-only",
    }
  );

  if (loading) {
    return <Spinner objective={true} />;
  }

  const tasks = data.clientPortalTasks || [];

  const updatedProps = {
    ...props,
    tasks,
    loading,
    currentUser,
  };

  return <Task {...updatedProps} />;
}

const WithConsumer = (props) => {
  return (
    <AppConsumer>
      {({ currentUser }: Store) => {
        return <TaskContainer {...props} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
