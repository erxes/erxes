import { Config, IUser, Store } from "../../types";
import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../graphql";

import { Alert } from "../../utils";
import { AppConsumer } from "../../appContext";
import Form from "../components/Form";
import React from "react";
import { capitalize } from "../../common/utils";

type Props = {
  config: Config;
  currentUser: IUser;
  type: string;
  closeModal: () => void;
};

function FormContainer({
  config = {},
  currentUser,
  closeModal,
  type,
  ...props
}: Props) {
  const [createItem] = useMutation(gql(mutations.clientPortalCreateCard), {
    refetchQueries: [
      { query: gql(queries[`clientPortal${capitalize(type)}s`]) }
    ]
  });

  const { data: customFields } = useQuery(gql(queries.fields), {
    variables: {
      contentType: `cards:${type}`,
      pipelineId: config[`${type}PipelineId`],
      isVisibleToCreate: true
    },
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken
      }
    }
  });

  const labelsQuery = useQuery(gql(queries.pipelineLabels), {
    variables: {
      pipelineId: config[`${type}PipelineId`]
    },
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken
      }
    }
  });

  const { data: departments } = useQuery(gql(queries.departments), {
    variables: {
      withoutUserFilter: true
    },
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken
      }
    }
  });

  const { data: branches } = useQuery(gql(queries.branches), {
    variables: {
      withoutUserFilter: true
    },
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken
      }
    }
  });

  const { data: products } = useQuery(gql(queries.products), {
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken
      }
    }
  });

  const handleSubmit = doc => {
    createItem({
      variables: {
        ...doc,
        type,
        stageId: config[`${type}StageId`],
        email: currentUser.email
      }
    }).then(() => {
      Alert.success(`You've successfully created a ${type}`);

      closeModal();
    });
  };

  const labels = labelsQuery?.data?.pipelineLabels || [];

  const updatedProps = {
    ...props,
    customFields:
      customFields?.fields.filter(f => f.field !== "description") || [],
    departments: departments?.departments || [],
    branches: branches?.branches || [],
    products: products?.products || [],
    labels,
    type,
    closeModal,
    handleSubmit,
    currentUser,
    config
  };

  return <Form {...updatedProps} />;
}

const WithConsumer = props => {
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
