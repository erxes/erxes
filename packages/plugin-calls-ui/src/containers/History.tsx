import { Alert, confirm } from "@erxes/ui/src/utils";
import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../graphql";

import History from "../components/History";
import React from "react";

type Props = {
  changeMainTab: (phoneNumber: string, shiftTab: string) => void;
};

const HistoryContainer = (props: Props) => {
  let histories;
  const { changeMainTab } = props;
  const { data, loading, error, refetch } = useQuery(
    gql(queries.callHistories),
    {
      fetchPolicy: "network-only",
    }
  );
  const [removeHistory] = useMutation(gql(mutations.callHistoryRemove), {
    refetchQueries: ["CallHistories"],
  });

  if (error) {
    Alert.error(error.message);
  }

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
    />
  );
};

export default HistoryContainer;
