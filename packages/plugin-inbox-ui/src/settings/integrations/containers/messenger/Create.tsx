import { Alert, __ } from "coreui/utils";
import {
  SaveMessengerAppearanceMutationResponse,
  SaveMessengerAppsMutationResponse,
  SaveMessengerConfigsMutationResponse,
  SaveMessengerMutationResponse,
  SaveMessengerMutationVariables,
  SaveMessengerTicketMutationResponse
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
import { queries as brandQueries } from "@erxes/ui/src/brands/graphql";
import { integrationsListParams } from "@erxes/ui-inbox/src/settings/integrations/containers/utils";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { queries as kbQueries } from "@erxes/ui-knowledgebase/src/graphql";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  integrationId?: string;
};

const CreateMessenger = (props: Props) => {
  const navigate = useNavigate();
  const { queryParams, integrationId } = props;

  const { data: usersData, loading: usersLoading } =
    useQuery<UsersQueryResponse>(gql(queries.users));
  const { data: brandsData, loading: brandsLoading } =
    useQuery<BrandsQueryResponse>(gql(brandQueries.brands), {
      fetchPolicy: "network-only"
    });
  const { data: topicsData } = useQuery<TopicsQueryResponse>(
    gql(kbQueries.knowledgeBaseTopics),
    {
      skip: !isEnabled("knowledgebase") ? true : false
    }
  );

  const [saveMessengerMutation] = useMutation<
    SaveMessengerMutationResponse,
    SaveMessengerMutationVariables
  >(gql(mutations.integrationsCreateMessenger), {
    refetchQueries: [
      {
        query: gql(queries.integrations),
        variables: integrationsListParams(queryParams)
      },
      { query: gql(queries.integrationTotalCount) }
    ]
  });

  const [saveConfigsMutation] =
    useMutation<SaveMessengerConfigsMutationResponse>(
      gql(mutations.integrationsSaveMessengerConfigs),
      {
        refetchQueries: [
          {
            query: gql(queries.integrationDetail),
            variables: { _id: integrationId || "" },
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
            variables: { _id: integrationId || "" },
            fetchPolicy: "network-only"
          }
        ]
      }
    );
  const [saveTicketData] = useMutation<SaveMessengerTicketMutationResponse>(
    gql(mutations.integrationsSaveMessengerTicketData),
    {
      refetchQueries: [
        {
          query: gql(queries.integrationDetail),
          variables: { _id: integrationId || "" },
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
            variables: { _id: integrationId || "" },
            fetchPolicy: "network-only"
          }
        ]
      }
    );

  const [isLoading, setIsLoading] = React.useState(false);

  if (usersLoading || brandsLoading) {
    return <Spinner />;
  }

  const users = usersData?.users || [];
  const brands = brandsData?.brands || [];
  const topics = topicsData?.knowledgeBaseTopics || [];

  const save = (doc) => {
    const {
      name,
      brandId,
      languageCode,
      messengerData,
      ticketData,
      uiOptions,
      channelIds,
      messengerApps,
      callData
    } = doc;

    let id = "";
    saveMessengerMutation({
      variables: { name, brandId, languageCode, channelIds }
    })
      .then(({ data = {} as any }) => {
        setIsLoading(true);

        const integrationId = data.integrationsCreateMessengerIntegration._id;
        id = integrationId;
        return saveConfigsMutation({
          variables: { _id: integrationId, messengerData, callData }
        });
      })
      .then(({ data = {} as any }) => {
        const integrationId = data.integrationsSaveMessengerConfigs._id;

        saveTicketData({
          variables: { _id: integrationId, ticketData }
        });
        return saveAppearanceMutation({
          variables: { _id: integrationId, uiOptions }
        });
      })
      .then(({ data = {} as any }) => {
        const integrationId = data.integrationsSaveMessengerAppearanceData._id;

        return messengerAppSaveMutation({
          variables: { integrationId, messengerApps }
        });
      })
      .then(() => {
        Alert.success("You successfully added an integration");
        navigate(
          `/settings/integrations?refetch=true&_id=${id}&kind=messenger`
        );
      })
      .catch((error) => {
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
    isLoading
  };

  return <Form {...updatedProps} />;
};

export default CreateMessenger;
