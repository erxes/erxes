import React from "react";
import { useQuery, useMutation } from "react-apollo";
import gql from "graphql-tag";
import { Alert, confirm } from "erxes-ui";
import List from "../components/List";
import { mutations, queries } from "../graphql";

type Props = {
  queryParams: any;
  filter: string;
};

export default function ListContainer(props: Props) {
  const { queryParams, filter } = props;

  const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 20;

  const feedResponse = useQuery(gql(queries.feed), {
    variables: {
      limit,
    },
  });

  const [deleteMutation] = useMutation(gql(mutations.deleteFeed));

  if (feedResponse.loading) {
    return <div>...</div>;
  }

  const deleteItem = (_id: string) => {
    confirm().then(() => {
      deleteMutation({ variables: { _id } })
        .then(() => {
          Alert.success("You successfully deleted.");

          feedResponse.refetch();
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const { list, totalCount } = feedResponse.data.exmFeed || {};

  return (
    <List
      deleteItem={deleteItem}
      list={list}
      totalCount={totalCount}
      limit={limit}
      filter={filter}
    />
  );
}
