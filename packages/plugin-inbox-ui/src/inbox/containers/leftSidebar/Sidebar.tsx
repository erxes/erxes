import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  ResolveAllMutationResponse,
  ResolveAllMutationVariables
} from '@erxes/ui-inbox/src/inbox/types';
import {
  getConfig,
  refetchSidebarConversationsOptions,
  setConfig
} from '@erxes/ui-inbox/src/inbox/utils';
import { mutations, queries } from '@erxes/ui-inbox/src/inbox/graphql';

import { AppConsumer } from 'coreui/appContext';
import Bulk from '@erxes/ui/src/components/Bulk';
import DumbSidebar from '../../components/leftSidebar/Sidebar';
import { IBulkContentProps } from '@erxes/ui/src/components/Bulk';
import { IRouterProps } from '@erxes/ui/src/types';
import { InboxManagementActionConsumer } from '../InboxCore';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

type Props = {
  queryParams: any;
  currentConversationId?: string;
} & IRouterProps;

type FinalProps = Props & ResolveAllMutationResponse;

const STORAGE_KEY = 'erxes_additional_sidebar_config';

class Sidebar extends React.Component<FinalProps> {
  toggle = ({ isOpen }: { isOpen: boolean }) => {
    const config = getConfig(STORAGE_KEY);

    config.showAddition = isOpen;

    setConfig(STORAGE_KEY, config);
  };

  // resolve all conversation
  resolveAll = notifyHandler => () => {
    const message = 'Are you sure you want to resolve all conversations?';

    confirm(message).then(() => {
      this.props
        .resolveAllMutation({ variables: this.props.queryParams })
        .then(() => {
          if (notifyHandler) {
            notifyHandler();
          }

          Alert.success('The conversation has been resolved!');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  render() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setConfig(STORAGE_KEY, {
        showAddition: false,
        showChannels: true,
        showBrands: false,
        showIntegrations: false,
        showTags: false,
        showSegments: false
      });
    }

    const { currentConversationId, queryParams, history } = this.props;
    const content = ({ bulk, toggleBulk, emptyBulk }: IBulkContentProps) => {
      return (
        <AppConsumer>
          {({ currentUser }) => (
            <InboxManagementActionConsumer>
              {({ notifyConsumersOfManagementAction }) => (
                <DumbSidebar
                  currentUser={currentUser}
                  currentConversationId={currentConversationId}
                  queryParams={queryParams}
                  history={history}
                  bulk={bulk}
                  emptyBulk={emptyBulk}
                  toggleBulk={toggleBulk}
                  config={getConfig(STORAGE_KEY)}
                  toggleSidebar={this.toggle}
                  resolveAll={this.resolveAll(
                    notifyConsumersOfManagementAction
                  )}
                />
              )}
            </InboxManagementActionConsumer>
          )}
        </AppConsumer>
      );
    };

    return <Bulk content={content} />;
  }
}

export default withRouter<Props>(
  withProps<Props>(
    compose(
      graphql<Props, ResolveAllMutationResponse, ResolveAllMutationVariables>(
        gql(mutations.resolveAll),
        {
          name: 'resolveAllMutation',
          options: () => refetchSidebarConversationsOptions()
        }
      )
    )(Sidebar)
  )
);
