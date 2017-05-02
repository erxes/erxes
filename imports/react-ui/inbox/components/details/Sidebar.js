import React, { PropTypes, Component } from 'react';
import { Button, Dropdown, MenuItem } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import {
  Pagination,
  ConversationsList,
  LoadingContent,
  EmptyState,
  DropdownToggle,
} from '/imports/react-ui/common';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Resolver } from '../../containers';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from '/imports/api/integrations/constants';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  changeStatus: PropTypes.func.isRequired,
  readConversations: PropTypes.array.isRequired,
  unreadConversations: PropTypes.array.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  channelId: PropTypes.string,
  bulk: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  emptyBulk: PropTypes.func.isRequired,
  user: PropTypes.object,
  conversationReady: PropTypes.bool,
};

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedIntegration: FlowRouter.getQueryParam('integrationType') || 'All Integrations',
    };

    this.changeStatus = this.changeStatus.bind(this);
  }

  // change resolved status
  changeStatus() {
    let status = this.props.conversation.status;

    if (status === CONVERSATION_STATUSES.CLOSED) {
      status = CONVERSATION_STATUSES.OPEN;
    } else {
      status = CONVERSATION_STATUSES.CLOSED;
    }

    // call change status method
    this.props.changeStatus(this.props.conversation._id, status, () => {
      if (status === CONVERSATION_STATUSES.CLOSED) {
        Alert.success('The conversation has been resolved!');
      } else {
        Alert.info('The conversation has been reopened and restored to Inbox.');
      }
    });
  }

  renderStatusButton() {
    const { bulk, emptyBulk } = this.props;
    let bsStyle = 'success';

    if (bulk.length !== 0) {
      return (
        <Resolver
          conversations={bulk}
          afterSave={emptyBulk}
          resolveText="Resolve selected"
          bsStyle={bsStyle}
        />
      );
    }

    let text = 'Resolve';
    let icon = <i className="ion-checkmark-circled" />;

    if (this.props.conversation.status === CONVERSATION_STATUSES.CLOSED) {
      text = 'Open';
      bsStyle = 'warning';
      icon = <i className="ion-refresh" />;
    }

    return (
      <Button bsStyle={bsStyle} onClick={this.changeStatus} className="action-btn">
        {icon} {text}
      </Button>
    );
  }

  renderSidebarContent() {
    const {
      readConversations,
      unreadConversations,
      hasMore,
      loadMore,
      channelId,
      user,
      toggleBulk,
      conversationReady,
    } = this.props;

    if (unreadConversations.length === 0 && readConversations.length === 0 && conversationReady) {
      return (
        <EmptyState
          text="There aren’t any conversations."
          size="small"
          icon={<i className="ion-email" />}
        />
      );
    } else if (!conversationReady) {
      return <LoadingContent items={5} />;
    }

    return (
      <Pagination hasMore={hasMore} loadMore={loadMore}>
        <ConversationsList
          conversations={unreadConversations}
          user={user}
          toggleBulk={toggleBulk}
          channelId={channelId}
          simple
        />
        <ConversationsList
          conversations={readConversations}
          user={user}
          toggleBulk={toggleBulk}
          channelId={channelId}
          simple
        />
      </Pagination>
    );
  }

  renderIntegration(integrationType, index) {
    const onClick = () => {
      Wrapper.Sidebar.filter('integrationType', integrationType);
      this.setState({ selectedIntegration: integrationType });
    };

    return (
      <MenuItem
        key={index}
        onClick={onClick}
        className={Wrapper.Sidebar.getActiveClass('integrationType', integrationType)}
      >
        {integrationType}
      </MenuItem>
    );
  }

  renderSectionHeader() {
    const queryParamName = 'integrationType';
    const { Section, filter } = Wrapper.Sidebar;
    const integrations = INTEGRATIONS_TYPES.ALL_LIST;
    const onClick = () => {
      filter(queryParamName, '');
      this.setState({ selectedIntegration: 'All Integrations' });
    };

    return (
      <Section.QuickButtons>
        <Dropdown id="dropdown-integration" className="quick-button" pullRight>
          <DropdownToggle bsRole="toggle">
            {this.state.selectedIntegration} <i className="ion-android-arrow-dropdown" />
          </DropdownToggle>
          <Dropdown.Menu>
            <MenuItem onClick={onClick}>All Integrations</MenuItem>
            {integrations.map((t, i) => this.renderIntegration(t, i))}
          </Dropdown.Menu>
        </Dropdown>
      </Section.QuickButtons>
    );
  }

  render() {
    const Sidebar = Wrapper.Sidebar;
    const { Title } = Sidebar.Section;
    return (
      <Sidebar size="wide" fixedContent={this.renderStatusButton()}>
        <Sidebar.Section className="full">
          <Title>CONVERSATIONS</Title>
          {this.renderSectionHeader()}
          {this.renderSidebarContent()}
        </Sidebar.Section>
      </Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
