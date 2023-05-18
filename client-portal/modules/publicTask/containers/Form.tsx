import { Config, IUser, Store, Task } from "../../types";
import React, { useContext } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";

import { Alert } from "../../utils";
import { AppConsumer } from "../../appContext";
import Form from "../components/Form";

type Props = {
  config: Config;
  currentUser: IUser;
};

export const clientPortalCreateTask = gql`
  mutation clientPortalCreateCard(
    $type: String!
    $stageId: String!
    $subject: String!
    $description: String
    $priority: String
    $attachments: [AttachmentInput]
  ) {
    clientPortalCreateCard(
      type: $type
      stageId: $stageId
      subject: $subject
      description: $description
      priority: $priority
      attachments: $attachments
    )
  }
`;

export const getPipelineLabels = gql`
  query pipelineLabels($pipelineId: String!) {
    pipelineLabels(pipelineId: $pipelineId) {
      _id
      name
      colorCode
    }
  }
`;

function FormContainer({ config = {}, currentUser, ...props }: Props) {
  useQuery(getPipelineLabels, {
    variables: { pipelineId: config.taskPublicPipelineId },
    skip: !config.taskPublicPipelineId,
  });

  const [createTask] = useMutation(clientPortalCreateTask, {});

  const handleSubmit = (doc: Task) => {
    if (!currentUser) {
      return Alert.error("Log in first to create task");
    }

    createTask({
      variables: {
        ...doc,
        type: "task",
        stageId: config.taskStageId,
        email: currentUser.email,
        priority: "Critical", // TODO: Add select in Form
      },
    }).then(() => {
      window.location.href = "/publicTasks";
    });
  };

  const updatedProps = {
    ...props,
    handleSubmit,
  };

  return <Form {...updatedProps} />;
}

const WithConsumer = (props) => {
  return (
    <AppConsumer>
      {({ currentUser, config }: Store) => {
        return (
          <FormContainer {...props} config={config} currentUser={currentUser} />
        );
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
