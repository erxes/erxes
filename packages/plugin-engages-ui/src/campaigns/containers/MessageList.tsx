import * as compose from "lodash.flowright";
import * as routerUtils from "@erxes/ui/src/utils/router";

import {
  EngageMessagesQueryResponse,
  EngageMessagesTotalCountQueryResponse,
  ListQueryVariables,
} from "@erxes/ui-engage/src/types";
import React, { useEffect, useState } from "react";

import Bulk from "@erxes/ui/src/components/Bulk";
import MessageList from "../components/MessageList";
import { generateListQueryVariables } from "@erxes/ui-engage/src/utils";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "@erxes/ui-engage/src/graphql";
import queryString from "query-string";
import { useLocation } from "react-router-dom";
import { withProps } from "@erxes/ui/src/utils";

type Props = {
  type: string;
  queryParams: any;
  loading: boolean;
};

type FinalProps = {
  engageMessagesQuery: EngageMessagesQueryResponse;
  engageMessagesTotalCountQuery: EngageMessagesTotalCountQueryResponse;
  engageStatsQuery: any;
} & Props;

const MessageListContainer = (props: FinalProps) => {
  const location = useLocation();

  const [bulk, setBulk] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    const shouldRefetchList = routerUtils.getParam(
      location,
      "engageRefetchList"
    );

    if (shouldRefetchList) {
      refetch();
    }
  }, []);

  const refetch = () => {
    const {
      engageMessagesQuery,
      engageMessagesTotalCountQuery,
      engageStatsQuery,
    } = props;

    engageMessagesQuery.refetch();
    engageMessagesTotalCountQuery.refetch();
    engageStatsQuery.refetch();
  };

  const {
    queryParams,
    engageMessagesQuery,
    engageMessagesTotalCountQuery,
    engageStatsQuery,
  } = props;

  const updatedProps = {
    kind: queryParams.kind,
    messages: engageMessagesQuery.engageMessages || [],
    totalCount: engageMessagesTotalCountQuery.engageMessagesTotalCount || 0,
    bulk,
    isAllSelected,
    queryParams,
    loading: engageMessagesQuery.loading || engageStatsQuery.loading,
    emailPercentages: engageStatsQuery.engageEmailPercentages || {},
    refetch,
  };

  const content = (props) => {
    return <MessageList {...updatedProps} {...props} />;
  };

  return <Bulk content={content} />;
};

const MessageListContainerWithData = withProps<Props>(
  compose(
    graphql<Props, EngageMessagesQueryResponse, ListQueryVariables>(
      gql(queries.engageMessages),
      {
        name: "engageMessagesQuery",
        options: (props) => ({
          variables: generateListQueryVariables(props),
        }),
      }
    ),
    graphql<Props, EngageMessagesTotalCountQueryResponse, ListQueryVariables>(
      gql(queries.engageMessagesTotalCount),
      {
        name: "engageMessagesTotalCountQuery",
        options: (props) => ({
          variables: generateListQueryVariables(props),
        }),
      }
    ),
    graphql<Props, EngageMessagesTotalCountQueryResponse, ListQueryVariables>(
      gql(queries.engageEmailPercentages),
      {
        name: "engageStatsQuery",
      }
    )
  )(MessageListContainer)
);

const EngageListContainer = (props: Props) => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <MessageListContainerWithData {...extendedProps} />;
};

export default EngageListContainer;
