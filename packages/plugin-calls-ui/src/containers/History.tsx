import { Alert, confirm } from "@erxes/ui/src/utils";
import React, { useCallback, useEffect, useState } from "react";
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
  const [loadingHistories, setLoadingHistories] = useState(true);

  const navigate = useNavigate();

  const { changeMainTab, callUserIntegrations } = props;
  const defaultCallIntegration = localStorage.getItem(
    "config:call_integrations"
  );

  const inboxId =
    JSON.parse(defaultCallIntegration || "{}")?.inboxId ||
    callUserIntegrations?.[0]?.inboxId;

  const { data, loading, error, refetch, fetchMore } = useQuery(
    gql(queries.callHistories),
    {
      variables: {
        integrationId: inboxId,
        searchValue,
        limit: 5,
      },
      fetchPolicy: "network-only",
    }
  );

  const callHistoriesTotalCountQuery = useQuery(
    gql(queries.callHistoriesTotalCount)
  );

  const histories = data?.callHistories || [];
  const totalCount =
    callHistoriesTotalCountQuery?.data?.callHistoriesTotalCount || 0;
  console.log(callHistoriesTotalCountQuery);
  const [removeHistory] = useMutation(gql(mutations.callHistoryRemove), {
    refetchQueries: ["CallHistories"],
  });

  const onLoadMore = (skip: number) => {
    return fetchMore({
      variables: {
        limit: 5,
        skip,
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.callHistories.length === 0) {
          return prevResult;
        }
        console.log("here after updateQuery", prevResult, fetchMoreResult);
        const prevHistories = prevResult.callHistories || [];
        const prevHistoriesIds = prevHistories.map((t: any) => t._id);

        const fetchedHistories: any[] = [];

        for (const t of fetchMoreResult.callHistories) {
          if (!prevHistoriesIds.includes(t._id)) {
            fetchedHistories.push(t);
          }
        }

        return {
          ...prevResult,
          callHistories: [...prevHistories, ...fetchedHistories],
        };
      },
    });
  };

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
      onLoadMore={onLoadMore}
      totalCount={histories.length || 0}
    />
  );
};

export default HistoryContainer;
