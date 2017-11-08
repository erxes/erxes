import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { ConversationList, Icon } from 'modules/common/components';

const propTypes = {
  conversations: PropTypes.array.isRequired
};

class Sidebar extends Component {
  renderSidebarHeader() {
    return (
      <Wrapper.Sidebar.Header>
        <div>
          # Sales (13) <Icon icon="ios-arrow-down" />
        </div>
        <div>
          Open <Icon icon="ios-arrow-down" />
        </div>
      </Wrapper.Sidebar.Header>
    );
  }

  renderSidebarFooter() {
    return (
      <Wrapper.Sidebar.Footer>
        <div>
          Brand <Icon icon="ios-arrow-up" />
        </div>
        <div>
          Integration <Icon icon="ios-arrow-up" />
        </div>
        <div>
          Tag <Icon icon="ios-arrow-up" />
        </div>
      </Wrapper.Sidebar.Footer>
    );
  }

  render() {
    const Sidebar = Wrapper.Sidebar;
    const { conversations } = this.props;

    // const { conversation } = this.props;
    // const { integration = {} } = conversation;
    // const { brand = {}, channels = [] } = integration;

    return (
      <Sidebar
        wide
        full
        header={this.renderSidebarHeader()}
        footer={this.renderSidebarFooter()}
      >
        <ConversationList
          conversations={conversations}
          user={conversations[0].user}
        />
      </Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
