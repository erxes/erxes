import { Alert, __ } from "coreui/utils";
import {
  EditMessengerMutationResponse,
  EditMessengerMutationVariables,
  IntegrationDetailQueryResponse,
  MessengerAppsQueryResponse,
  SaveMessengerAppearanceMutationResponse,
  SaveMessengerAppsMutationResponse,
  SaveMessengerConfigsMutationResponse
} from "@erxes/ui-inbox/src/settings/integrations/types";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  mutations,
  queries
} from "@erxes/ui-inbox/src/settings/integrations/graphql";

import { BrandsQueryResponse } from "@erxes/ui/src/brands/types";
import Form from "../../components/messenger/Form";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { TopicsQueryResponse } from "@erxes/ui-knowledgebase/src/types";
import { UsersQueryResponse } from "@erxes/ui/src/auth/types";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { queries as kbQueries } from "@erxes/ui-knowledgebase/src/graphql";
import { useNavigate } from "react-router-dom";

type Props = {
  integrationId: string;
};

const EditMessenger = (props: Props) => {
  const { integrationId } = props;
  const navigate = useNavigate();

  const { data: usersData, loading: usersLoading } =
    useQuery<UsersQueryResponse>(gql(queries.users));
  const { data: brandsData, loading: brandsLoading } =
    useQuery<BrandsQueryResponse>(gql(queries.brands), {
      fetchPolicy: "network-only"
    });
  const { data: topicsData } = useQuery<TopicsQueryResponse>(
    gql(kbQueries.knowledgeBaseTopics),
    {
      skip: !isEnabled("knowledgebase") ? true : false
    }
  );
  const { data: integrationDetailData, loading: integrationDetailLoading } =
    useQuery<IntegrationDetailQueryResponse>(gql(queries.integrationDetail), {
      variables: { _id: integrationId },
      fetchPolicy: "network-only"
    });
  const { data: messengerAppsData, loading: messengerAppsLoading } =
    useQuery<MessengerAppsQueryResponse>(gql(queries.messengerApps), {
      variables: { integrationId },
      fetchPolicy: "network-only"
    });

  const [editMessengerMutation] = useMutation<
    EditMessengerMutationResponse,
    EditMessengerMutationVariables
  >(gql(mutations.integrationsEditMessenger), {
    refetchQueries: [
      {
        query: gql(queries.integrationDetail),
        variables: { _id: integrationId },
        fetchPolicy: "network-only"
      }
    ]
  });

  const [saveConfigsMutation] =
    useMutation<SaveMessengerConfigsMutationResponse>(
      gql(mutations.integrationsSaveMessengerConfigs),
      {
        refetchQueries: [
          {
            query: gql(queries.integrationDetail),
            variables: { _id: integrationId },
            fetchPolicy: "network-only"
          }
        ]
      }
    );

  const [saveAppearanceMutation] =
    useMutation<SaveMessengerAppearanceMutationResponse>(
      gql(mutations.integrationsSaveMessengerAppearance),
      {
        refetchQueries: [
          {
            query: gql(queries.integrationDetail),
            variables: { _id: integrationId },
            fetchPolicy: "network-only"
          }
        ]
      }
    );

  const [messengerAppSaveMutation] =
    useMutation<SaveMessengerAppsMutationResponse>(
      gql(mutations.messengerAppSave),
      {
        refetchQueries: [
          {
            query: gql(queries.integrationDetail),
            variables: { _id: integrationId },
            fetchPolicy: "network-only"
          }
        ]
      }
    );

  const [isLoading, setIsLoading] = React.useState(false);

  if (
    integrationDetailLoading ||
    usersLoading ||
    brandsLoading ||
    messengerAppsLoading
  ) {
    return <Spinner />;
  }

  const users = usersData?.users || [];
  const brands = brandsData?.brands || [];
  const integration = integrationDetailData?.integrationDetail || {};
  const topics = topicsData?.knowledgeBaseTopics || [];
  const apps = messengerAppsData?.messengerApps || {};

  const deleteTypeName = datas => {
    return (datas || []).map(({ __typename, ...item }) => item);
  };

  const save = doc => {
    const {
      name,
      brandId,
      channelIds,
      languageCode,
      messengerData,
      uiOptions,
      messengerApps
    } = doc;

    setIsLoading(true);

    editMessengerMutation({
      variables: {
        _id: integrationId,
        name,
        brandId,
        languageCode,
        channelIds
      }
    })
      .then(({ data = {} as any }) => {
        const id = data.integrationsEditMessengerIntegration._id;

        return saveConfigsMutation({
          variables: { _id: id, messengerData }
        });
      })
      .then(({ data = {} as any }) => {
        const id = data.integrationsSaveMessengerConfigs._id;

        return saveAppearanceMutation({
          variables: { _id: id, uiOptions }
        });
      })
      .then(() => {
        const messengerAppsWithoutTypename = {
          websites: deleteTypeName(messengerApps.websites),
          knowledgebases: deleteTypeName(messengerApps.knowledgebases),
          leads: deleteTypeName(messengerApps.leads)
        };
        console.log("here", messengerAppsWithoutTypename);
        return messengerAppSaveMutation({
          variables: {
            integrationId,
            messengerApps: messengerAppsWithoutTypename
          }
        });
      })
      .then(() => {
        Alert.success("You successfully updated a messenger");
        console.log("here11");
        navigate("/settings/integrations?refetch=true");
      })
      .catch(error => {
        console.log("here22", error);
        if (error.message.includes("Duplicated messenger for single brand")) {
          return Alert.warning(
            __(
              "You've already created a messenger for the brand you've selected. Please choose a different brand or edit the previously created messenger"
            ),
            6000
          );
        }

        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    teamMembers: users || [],
    brands,
    save,
    topics,
    integration: integration || ({} as any),
    messengerApps: apps,
    isLoading
  };

  return <Form {...updatedProps} />;
};

export default EditMessenger;
