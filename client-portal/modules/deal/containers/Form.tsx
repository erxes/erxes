import { Config, IUser, Store, Ticket } from "../../types";
import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../graphql";

import { Alert } from "../../utils";
import { AppConsumer } from "../../appContext";
import Form from "../components/Form";
import React from "react";

type Props = {
  config: Config;
  currentUser: IUser;
  closeModal: () => void;
};

function FormContainer({
  config = {},
  currentUser,
  closeModal,
  ...props
}: Props) {
  const [createDeal] = useMutation(gql(mutations.clientPortalCreateDeal), {
    refetchQueries: [{ query: gql(queries.clientPortalDeals) }],
  });

  const { data: customFields } = useQuery(gql(queries.fields), {
    variables: {
      contentType: "cards:deal",
      pipelineId: config?.dealPipelineId,
      isVisibleToCreate: true,
    },
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken,
      },
    },
  });

  const labelsQuery = useQuery(gql(queries.pipelineLabels), {
    variables: {
      pipelineId: config?.dealPipelineId,
    },
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken,
      },
    },
  });

  const { data: departments } = useQuery(gql(queries.departments), {
    variables: {
      withoutUserFilter: true,
    },
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken,
      },
    },
  });

  const { data: branches } = useQuery(gql(queries.branches), {
    variables: {
      withoutUserFilter: true,
    },
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken,
      },
    },
  });

  const { data: products } = useQuery(gql(queries.products), {
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken,
      },
    },
  });

  const handleSubmit = (doc: Ticket) => {
    createDeal({
      variables: {
        ...doc,
        type: "deal",
        stageId: config.dealStageId,
        email: currentUser.email,
      },
    }).then(() => {
      Alert.success("You've successfully created a sales pipeline");

      closeModal();
    });
  };

  const labels = labelsQuery?.data?.pipelineLabels || [];

  const updatedProps = {
    ...props,
    customFields:
      customFields?.fields.filter((f) => f.field !== "description") || [],
    departments: departments?.departments || [],
    branches: branches?.branches || [],
    products: products?.products || [],
    labels,
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
