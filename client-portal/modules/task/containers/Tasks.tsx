import { Config, IUser, Store } from "../../types";
import { gql, useQuery } from "@apollo/client";

import Layout from "../../main/containers/Layout";
import React from "react";
import Spinner from "../../common/Spinner";
import TaskHeader from "../components/Header";
import Tasks from "../components/Tasks";
import { withRouter } from "next/router";

type Props = {
  config: Config;
  router: any;
  currentUser: IUser;
};

const clientPortalGetTaskStages = `
  query clientPortalGetTaskStages {
    clientPortalGetTaskStages {
      _id
      name
    }
  }
`;

function TasksContainer({ config, router, ...props }: Props) {
  const { loading, data } = useQuery(gql(clientPortalGetTaskStages), {
    variables: { configId: config._id },
  });

  if (!data) {
    return null;
  }

  if (loading || Object.keys(data).length === 0) {
    return <Spinner objective={true} />;
  }

  const { stageId } = router.query;
  const stages = data.clientPortalGetTaskStages || [];

  if (router && !stageId && stages.length > 0) {
    router.push(`/tasks?stageId=${stages[0]._id}`);
  }

  const updatedProps = {
    ...props,
    config,
    stages,
    stageId,
  };

  return <Tasks {...updatedProps} />;
}

const WithRouterParams = (props) => {
  return (
    <Layout>
      {(layoutProps: Store) => {
        return <TasksContainer {...props} {...layoutProps} />;
      }}
    </Layout>
  );
};

export default withRouter(WithRouterParams);
