import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { ConversationList } from 'modules/common/components';
import FilterButton from './FilterButton';

const propTypes = {
  conversations: PropTypes.array.isRequired
};

class Sidebar extends Component {
  renderSidebarHeader() {
    return (
      <Wrapper.Sidebar.Header>
        <FilterButton
          buttonText="# Sales (13)"
          fields={[]}
          filter={() => {}}
          popoverTitle="Filter by channel"
        />
        <FilterButton
          buttonText="Open"
          fields={[]}
          filter={() => {}}
          popoverTitle="Filter by status"
        />
      </Wrapper.Sidebar.Header>
    );
  }

  renderSidebarFooter() {
    return (
      <Wrapper.Sidebar.Footer>
        <FilterButton
          buttonText="Brand"
          fields={[]}
          filter={() => {}}
          popoverTitle="Filter by brand"
          placement="top"
        />
        <FilterButton
          buttonText="Integration"
          fields={[]}
          filter={() => {}}
          popoverTitle="Filter by integration"
          placement="top"
        />
        <FilterButton
          buttonText="Tag"
          fields={[]}
          filter={() => {}}
          popoverTitle="Filter by tag"
          placement="top"
        />
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
