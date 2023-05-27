import { Config, IUser, Store } from "../../types";
import { gql, useQuery } from "@apollo/client";

import { AppConsumer } from "../../appContext";
import BoardItem from "../components/BoardItem";
import Group from "../components/Group";
import React from "react";
import Spinner from "../../common/Spinner";
import { capitalize } from "../../common/utils";
import { queries } from "../graphql";

type Props = {
  currentUser: IUser;
  config: Config;
  type: string;
  groupType: string;
  viewType: string;
  id: any;
};

function GroupContainer({ currentUser, type, viewType, ...props }: Props) {
  const { loading, data = {} as any } = useQuery(
    gql(queries[`clientPortal${capitalize(type)}s`]),
    {
      skip: !currentUser,
      fetchPolicy: "network-only",
      variables: {
        ...(props.groupType === "priority" && { priority: [props.id] }),
        ...(props.groupType === "label" && { labelIds: [props.id] }),
        ...(props.groupType === "duedate" && { closeDateType: props.id }),
        ...(props.groupType === "stage" && { stageId: props.id }),
        ...(props.groupType === "user" && { userIds: [props.id] }),
      },
      context: {
        headers: {
          "erxes-app-token": props.config?.erxesAppToken,
        },
      },
    }
  );

  if (loading) {
    return <Spinner objective={true} />;
  }

  const items = data[`clientPortal${capitalize(type)}s`] || [];

  const updatedProps = {
    ...props,
    type,
    items,
    loading,
    currentUser,
  };

  if (viewType === "board") {
    return <BoardItem items={items} />;
  }

  return <Group {...updatedProps} />;
}

const WithConsumer = (props) => {
  return (
    <AppConsumer>
      {({ currentUser, config }: Store) => {
        return (
          <GroupContainer
            {...props}
            config={config}
            currentUser={currentUser}
          />
        );
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
