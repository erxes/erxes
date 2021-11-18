import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from 'modules/common/components/Bulk';
import { IBulkContentProps } from 'modules/common/components/Bulk';
import { Alert, confirm, withProps } from 'modules/common/utils';
import DumbSidebar from 'modules/inbox/components/leftSidebar/Sidebar';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '../../../common/types';
import { mutations } from '../../graphql';
import {
  ResolveAllMutationResponse,
  ResolveAllMutationVariables
} from '../../types';
import { getConfig, setConfig } from '../../utils';
import { refetchSidebarConversationsOptions } from '../../utils';
import { InboxManagementActionConsumer } from '../Inbox';

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
        showTags: false
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
