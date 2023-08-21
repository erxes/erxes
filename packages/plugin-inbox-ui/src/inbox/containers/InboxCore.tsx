import { AppConsumer } from 'coreui/appContext';
import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { can, router as routerUtils } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import Empty from '../components/Empty';
import InboxCore from '../components/InboxCore';
import { queries } from '@erxes/ui-inbox/src/inbox/graphql';
import {
  ConvesationsQueryVariables,
  LastConversationQueryResponse
} from '@erxes/ui-inbox/src/inbox/types';
import { generateParams } from '@erxes/ui-inbox/src/inbox/utils';
interface IRouteProps {
  queryParams: any;
  history: any;
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

class WithRefetchHandling extends React.Component<
  any,
  IInboxRefetchController
> {
  constructor(props) {
    super(props);

    const notifHandler = () => {
      this.setState({ refetchRequired: new Date().toISOString() });
    };

    this.state = {
      notifyConsumersOfManagementAction: notifHandler,
      refetchRequired: ''
    };
  }

  public render() {
    return (
      <InboxManagementActionContext.Provider value={this.state}>
        {this.props.children}
      </InboxManagementActionContext.Provider>
    );
  }
}

class WithCurrentId extends React.Component<IProps> {
  componentWillReceiveProps(nextProps: IProps) {
    const { conversationsGetLast, loading, history, queryParams } = nextProps;
    const { _id } = queryParams;

    if (!_id && conversationsGetLast && !loading) {
      routerUtils.setParams(history, { _id: conversationsGetLast._id }, true);
    }
  }

  render() {
    return (
      <AppConsumer>
        {({ currentUser }) => {
          const { queryParams } = this.props;
          const { _id } = queryParams;

          if (!currentUser) {
            return null;
          }

          if (!_id || !can('showConversations', currentUser)) {
            return (
              <Empty queryParams={queryParams} currentUser={currentUser} />
            );
          }

          return (
            <WithRefetchHandling>
              <InboxCore
                queryParams={queryParams}
                currentConversationId={_id}
              />
            </WithRefetchHandling>
          );
        }}
      </AppConsumer>
    );
  }
}

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
      fetchPolicy: 'network-only'
    }),
    props: ({ data, ownProps }: { data?: any; ownProps: IRouteProps }) => {
      return {
        conversationsGetLast: data.conversationsGetLast,
        loading: data.loading,
        history: ownProps.history,
        queryParams: ownProps.queryParams
      };
    }
  })
)(WithCurrentId);
