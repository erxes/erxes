import gql from "graphql-tag";
import Alert from "modules/common/utils/Alert";
import * as React from "react";
import { compose, graphql } from "react-apollo";
import AssignBox from "../components/assignBox/AssignBox";
import { mutations, queries } from "../graphql";
import { IConversation } from "../types";
import { refetchSidebarConversationsOptions } from "../utils";

type Props = {
  targets: IConversation[];
  usersQuery: any;
  assignMutation: (
    doc: { variables: { conversationIds?: string[]; assignedUserId: string } }
  ) => Promise<any>;
  conversationsUnassign: (doc: { variables: { _ids: any[] } }) => Promise<any>;
};

const AssignBoxContainer = (props: Props) => {
  const { usersQuery, assignMutation, conversationsUnassign } = props;

  if (usersQuery.loading) {
    return null;
  }

  const assign = (
    {
      conversationIds,
      assignedUserId
    }: { conversationIds?: string[]; assignedUserId: string },
    callback: (e) => void
  ) => {
    assignMutation({
      variables: {
        conversationIds,
        assignedUserId
      }
    })
      .then(() => {
        Alert.success("The conversation Assignee has been renewed.");
      })
      .catch(e => {
        callback(e);
        Alert.error(e.message);
      });
  };

  const clear = conversationIds => {
    conversationsUnassign({
      variables: {
        _ids: [conversationIds]
      }
    })
      .then(() => {
        Alert.success("The conversation Assignee removed");
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    assignees: usersQuery.users || [],
    assign,
    clear
  };

  return <AssignBox {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.userList), { name: "usersQuery" }),
  graphql(gql(mutations.conversationsAssign), {
    name: "assignMutation",
    options: () => refetchSidebarConversationsOptions()
  }),
  graphql(gql(mutations.conversationsUnassign), {
    name: "conversationsUnassign",
    options: () => refetchSidebarConversationsOptions()
  })
)(AssignBoxContainer);
