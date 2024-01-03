import { Config, IUser, Store } from "../../types";
import { gql, useQuery } from "@apollo/client";

import Layout from "../../main/containers/Layout";
import PublicTasks from "../components/Tasks";
import React from "react";
import Spinner from "../../common/Spinner";
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

function PublicTasksContainer({ config, router, ...props }: Props) {
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
    router.push(`/publicTasks?stageId=${stages[0]._id}`);
  }

  const updatedProps = {
    ...props,
    config,
    stages,
    stageId,
  };

  return <PublicTasks {...updatedProps} />;
}

const WithRouterParams = (props) => {
  return (
    <Layout>
      {(layoutProps: Store) => {
        return <PublicTasksContainer {...props} {...layoutProps} />;
      }}
    </Layout>
  );
};

export default withRouter(WithRouterParams);
