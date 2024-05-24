import { Alert, confirm } from "@erxes/ui/src/utils";
import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../graphql";

import History from "../components/History";
import { useNavigate } from "react-router-dom";

type Props = {
  changeMainTab: (phoneNumber: string, shiftTab: string) => void;
  callUserIntegrations?: any;
};

const HistoryContainer = (props: Props) => {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  let histories;
  const { changeMainTab, callUserIntegrations } = props;
  const defaultCallIntegration = localStorage.getItem(
    "config:call_integrations"
  );

  const inboxId =
    JSON.parse(defaultCallIntegration || "{}")?.inboxId ||
    callUserIntegrations?.[0]?.inboxId;

  const { data, loading, error, refetch } = useQuery(
    gql(queries.callHistories),
    {
      variables: {
        integrationId: inboxId,
      },
      fetchPolicy: "network-only",
    }
  );
  const [removeHistory] = useMutation(gql(mutations.callHistoryRemove), {
    refetchQueries: ["CallHistories"],
  });

  if (error) {
    Alert.error(error.message);
  }

  const onSearch = (searchValue: string) => {
    setSearchValue(searchValue);
  };

  const remove = (id: string) => {
    confirm().then(() =>
      removeHistory({
        variables: {
          id,
        },
      })
        .then(() => {
          Alert.success("Successfully removed");
        })
        .catch((e) => {
          Alert.error(e.message);
        })
    );
  };
  histories = data?.callHistories;

  return (
    <History
      histories={histories}
      loading={loading}
      changeMainTab={changeMainTab}
      refetch={refetch}
      remove={remove}
      onSearch={onSearch}
      searchValue={searchValue}
      navigate={navigate}
    />
  );
};

export default HistoryContainer;
