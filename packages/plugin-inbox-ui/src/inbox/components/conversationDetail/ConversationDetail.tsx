import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import EmptySidebar from '@erxes/ui/src/layout/components/Sidebar';
import { MainContent, ContentBox } from '@erxes/ui/src/layout/styles';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import Sidebar from '../../containers/conversationDetail/Sidebar';
import {
  getPluginConfig,
  loadDynamicComponent
} from '@erxes/ui/src/utils/core';
import DmWorkArea, {
  resetDmWithQueryCache
} from '../../containers/conversationDetail/DmWorkArea';
import WorkArea from './workarea/WorkArea';

type Props = {
  currentConversation: IConversation;
  loading: boolean;
  conversationFields: IField[];
  refetchDetail: () => void;
};

export default class ConversationDetail extends React.Component<Props> {
  renderSidebar() {
    const { loading, currentConversation, conversationFields } = this.props;

    if (currentConversation) {
      return (
        <Sidebar
          conversation={currentConversation}
          conversationFields={conversationFields}
        />
      );
    }

    if (loading) {
      return (
        <EmptySidebar full={true}>
          <Spinner />
        </EmptySidebar>
      );
    }

    return (
      <EmptySidebar full={true}>
        <EmptyState
          text="Customer not found"
          size="full"
          image="/images/actions/18.svg"
        />
      </EmptySidebar>
    );
  }

  componentWillReceiveProps(nextProps: Readonly<Props>) {
    const current = this.props.currentConversation;
    const ncurrent = nextProps.currentConversation;

    if (
      current &&
      ncurrent &&
      current.integration.kind !== ncurrent.integration.kind
    ) {
      resetDmWithQueryCache();
    }
  }

  renderContent() {
    const { loading, currentConversation } = this.props;

    if (currentConversation) {
      const { integration } = currentConversation;
      const kind = integration.kind.split('-')[0];

      let content;

      if (
        !['messenger', 'lead', 'booking', 'webhook', 'callpro'].includes(
          currentConversation.integration.kind
        )
      ) {
        const integrations = getPluginConfig({
          pluginName: kind,
          configName: 'inboxIntegrations'
        });

        if (integrations) {
          const entry = integrations.find(i => i.kind === integration.kind);
          const key = 'inboxConversationDetail';

          if (entry && entry.components && entry.components.includes(key)) {
            content = loadDynamicComponent(
              key,
              {
                ...this.props,
                conversation: currentConversation
              },
              false,
              kind
            );
          }
        }

        if (content) {
          if (currentConversation.integration.kind === 'imap') {
            return <DmWorkArea content={content} {...this.props} />;
          }

          return (
            <WorkArea
              currentConversation={currentConversation}
              content={content}
            />
          );
        }
      }

      const dmConfig = getPluginConfig({
        pluginName: kind,
        configName: 'inboxDirectMessage'
      });

      if (dmConfig) {
        return <DmWorkArea {...this.props} dmConfig={dmConfig} />;
      }

      return <DmWorkArea {...this.props} />;
    }

    if (loading) {
      return (
        <ContentBox>
          <Spinner />
        </ContentBox>
      );
    }

    return (
      <EmptyState
        text="Conversation not found"
        size="full"
        image="/images/actions/14.svg"
      />
    );
  }

  render() {
    return (
      <React.Fragment>
        <MainContent>{this.renderContent()}</MainContent>
        {this.renderSidebar()}
      </React.Fragment>
    );
  }
}
