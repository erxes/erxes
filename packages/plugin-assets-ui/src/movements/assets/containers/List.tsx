import {
  MovementItemsQueryResponse,
  MovementItemsTotalCountQueryResponse,
} from "../../../common/types";
import { gql, useQuery } from "@apollo/client";

import MovementItem from "../components/List";
import React from "react";
import { generateParams } from "../../../common/utils";
import { queries } from "../graphql";

type Props = { queryParams: any; location: any; navigate: any };

const MovementItemsContainer = (props: Props) => {
  const { location, queryParams, navigate } = props;

  const itemsQuery = useQuery<MovementItemsQueryResponse>(gql(queries.items), {
    variables: generateParams({ queryParams }),
  });

  const itemsTotalCount = useQuery<MovementItemsTotalCountQueryResponse>(
    gql(queries.itemsTotalCount),
    {
      variables: generateParams({ queryParams }),
    }
  );

  const updatedProps = {
    items: itemsQuery?.data?.assetMovementItems || [],
    totalCount: itemsTotalCount?.data?.assetMovementItemsTotalCount || 0,
    loading: itemsQuery.loading || itemsTotalCount.loading,
    location,
    navigate,
    queryParams,
  };

  return <MovementItem {...updatedProps} />;
};

export default MovementItemsContainer;
