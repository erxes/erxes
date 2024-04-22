import * as compose from "lodash.flowright";

import {
  ConvesationsQueryVariables,
  LastConversationQueryResponse,
} from "@erxes/ui-inbox/src/inbox/types";
import React, { useEffect, useState } from "react";
import { can, router as routerUtils } from "@erxes/ui/src/utils";

import { AppConsumer } from "coreui/appContext";
import Empty from "../components/Empty";
import InboxCore from "../components/InboxCore";
import { generateParams } from "@erxes/ui-inbox/src/inbox/utils";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "@erxes/ui-inbox/src/inbox/graphql";

interface IRouteProps {
  queryParams: any;
  navigate: any;
  location: any;
}

interface IProps extends IRouteProps {
  conversationsGetLast: any;
  loading: boolean;
}

interface IInboxRefetchController {
  notifyConsumersOfManagementAction: () => void;
  refetchRequired: string;
}

const InboxManagementActionContext = React.createContext(
  {} as IInboxRefetchController
);

export const InboxManagementActionConsumer =
  InboxManagementActionContext.Consumer;

const WithRefetchHandling: React.FC<{ children }> = ({ children }) => {
  const [state, setState] = useState<IInboxRefetchController>({
    notifyConsumersOfManagementAction: () => {
      setState((prevState) => ({
        ...prevState,
        refetchRequired: new Date().toISOString(),
      }));
    },
    refetchRequired: "",
  });

  return (
    <InboxManagementActionContext.Provider value={state}>
      {children}
    </InboxManagementActionContext.Provider>
  );
};

const WithCurrentId: React.FC<IProps> = (props) => {
  const { conversationsGetLast, loading, queryParams, navigate, location } =
    props;
  const { _id } = queryParams;

  useEffect(() => {
    if (!_id && conversationsGetLast && !loading) {
      routerUtils.setParams(
        navigate,
        location,
        { _id: conversationsGetLast._id },
        true
      );
    }
  }, [_id, conversationsGetLast, loading]);

  return (
    <AppConsumer>
      {({ currentUser }) => {
        if (!currentUser) {
          return null;
        }

        if (!_id || !can("showConversations", currentUser)) {
          return <Empty queryParams={queryParams} currentUser={currentUser} />;
        }

        return (
          <WithRefetchHandling>
            <InboxCore queryParams={queryParams} currentConversationId={_id} />
          </WithRefetchHandling>
        );
      }}
    </AppConsumer>
  );
};

export default compose(
  graphql<
    IRouteProps,
    LastConversationQueryResponse,
    ConvesationsQueryVariables,
    IProps
  >(gql(queries.lastConversation), {
    skip: (props: IRouteProps) => {
      return props.queryParams._id;
    },
    options: (props: IRouteProps) => ({
      variables: generateParams(props.queryParams),
      fetchPolicy: "network-only",
    }),
    props: ({ data, ownProps }: { data?: any; ownProps: IRouteProps }) => {
      return {
        conversationsGetLast: data.conversationsGetLast,
        loading: data.loading,
        navigate: ownProps.navigate,
        location: ownProps.location,
        queryParams: ownProps.queryParams,
      };
    },
  })
)(WithCurrentId);
