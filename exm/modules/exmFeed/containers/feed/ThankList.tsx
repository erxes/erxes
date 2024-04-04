import { Alert, confirm } from "../../../utils";
import { mutations, queries } from "../../graphql";
import { useMutation, useQuery } from "@apollo/client";

import React from "react";
import Spinner from "../../../common/Spinner";
import ThankList from "../../components/feed/ThankList";
import gql from "graphql-tag";

type Props = {
  queryParams: any;
};

export default function ThankListContainer(props: Props) {
  const queryParams = props.queryParams || {};

  const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 20;

  const queryResponse = useQuery(gql(queries.thanks), {
    variables: {
      limit,
    },
  });

  const [deleteMutation] = useMutation(gql(mutations.deleteThank));

  if (queryResponse.loading) {
    return <Spinner objective={true} />;
  }

  const deleteItem = (_id: string) => {
    confirm().then(() => {
      deleteMutation({ variables: { _id } })
        .then(() => {
          Alert.success("You successfully deleted.");

          queryResponse.refetch();
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const { list, totalCount } = queryResponse.data.exmThanks || {};

  return (
    <ThankList
      queryParams={queryParams}
      deleteItem={deleteItem}
      list={list}
      limit={limit}
      totalCount={totalCount}
    />
  );
}
