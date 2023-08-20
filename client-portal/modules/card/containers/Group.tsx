import { Config, IUser, Store } from "../../types";
import { gql, useQuery } from "@apollo/client";

import AnimatedLoader from "../../common/AnimatedLoader";
import { AppConsumer } from "../../appContext";
import BoardItem from "../components/BoardItem";
import Group from "../components/Group";
import React from "react";
import { capitalize } from "../../common/utils";
import { queries } from "../graphql";

type Props = {
  currentUser: IUser;
  config: Config;
  type: string;
  groupType: string;
  viewType: string;
  id: any;
  item: any;
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
    return <AnimatedLoader loaderStyle={{ isBox: true }} />;
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
    return (
      <BoardItem
        items={items}
        type={type}
        stageId={props.id}
        item={props.item}
      />
    );
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
