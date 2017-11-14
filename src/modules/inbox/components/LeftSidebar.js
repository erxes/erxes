import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Wrapper } from 'modules/layout/components';
import { ConversationList } from 'modules/common/components';
import { FilterPopover, StatusFilterPopover } from './';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  currentConversationId: PropTypes.string.isRequired,
  channels: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
  onChangeConversation: PropTypes.func.isRequired,
  counts: PropTypes.object.isRequired
};

class Sidebar extends Component {
  componentWillMount() {
    moment.updateLocale('en', {
      relativeTime: {
        future: 'in %s',
        past: '%s ',
        s: 's',
        m: 'm',
        mm: '%d m',
        h: 'h',
        hh: '%d h',
        d: 'd',
        dd: '%d d',
        M: 'a mth',
        MM: '%d mths',
        y: 'y',
        yy: '%d y'
      }
    });
  }

  renderSidebarHeader() {
    const { channels, counts } = this.props;
    return (
      <Wrapper.Sidebar.Header>
        <FilterPopover
          buttonText="# Channel"
          popoverTitle="Filter by channel"
          fields={channels}
          counts={counts.byChannels}
          paramKey="channelId"
        />

        <StatusFilterPopover counts={counts} />
      </Wrapper.Sidebar.Header>
    );
  }

  renderSidebarFooter() {
    const { brands, tags, counts, integrations } = this.props;
    return (
      <Wrapper.Sidebar.Footer>
        <FilterPopover
          buttonText="Brand"
          fields={brands}
          counts={counts.byBrands}
          popoverTitle="Filter by brand"
          placement="top"
          paramKey="brandId"
        />

        <FilterPopover
          buttonText="Integration"
          fields={integrations}
          counts={counts.byIntegrationTypes}
          paramKey="integrationType"
          popoverTitle="Filter by integrations"
          placement="top"
        />

        <FilterPopover
          buttonText="Tag"
          fields={tags}
          counts={counts.byTags}
          paramKey="tag"
          popoverTitle="Filter by tag"
          placement="top"
          icon="pricetag"
        />
      </Wrapper.Sidebar.Footer>
    );
  }

  render() {
    const Sidebar = Wrapper.Sidebar;
    const {
      conversations,
      onChangeConversation,
      currentConversationId
    } = this.props;

    return (
      <Sidebar
        wide
        full
        header={this.renderSidebarHeader()}
        footer={this.renderSidebarFooter()}
      >
        <ConversationList
          conversations={conversations}
          onRowClick={onChangeConversation}
          currentConversationId={currentConversationId}
        />
      </Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
