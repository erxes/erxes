import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { ConversationList } from 'modules/common/components';
import FilterButton from './FilterButton';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  generatedChannels: PropTypes.array.isRequired,
  generatedBrands: PropTypes.array.isRequired,
  generatedTags: PropTypes.array.isRequired
};

class Sidebar extends Component {
  renderSidebarHeader() {
    const { generatedChannels } = this.props;
    return (
      <Wrapper.Sidebar.Header>
        <FilterButton
          buttonText="# Sales (13)"
          fields={generatedChannels}
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
    const { generatedBrands, generatedTags } = this.props;
    return (
      <Wrapper.Sidebar.Footer>
        <FilterButton
          buttonText="Brand"
          fields={generatedBrands}
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
          fields={generatedTags}
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
        <ConversationList conversations={conversations} />
      </Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
