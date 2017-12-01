import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Sidebar } from 'modules/layout/components';
import { ConversationList, LoadMore, Spinner } from 'modules/common/components';
import { FilterPopover, StatusFilterPopover } from '../';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  currentConversationId: PropTypes.string,
  channels: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
  onChangeConversation: PropTypes.func.isRequired,
  counts: PropTypes.object.isRequired,
  totalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool
};

class LeftSidebar extends Component {
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
      <Sidebar.Header>
        <FilterPopover
          buttonText="# Channel"
          popoverTitle="Filter by channel"
          fields={channels}
          counts={counts.byChannels}
          paramKey="channelId"
        />

        <StatusFilterPopover counts={counts} />
      </Sidebar.Header>
    );
  }

  renderSidebarFooter() {
    const { brands, tags, counts, integrations } = this.props;
    return (
      <Sidebar.Footer>
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
      </Sidebar.Footer>
    );
  }

  render() {
    const {
      conversations,
      onChangeConversation,
      currentConversationId,
      totalCount,
      loading
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
        {loading && <Spinner />}
        <LoadMore all={totalCount} />
      </Sidebar>
    );
  }
}

LeftSidebar.propTypes = propTypes;

export default LeftSidebar;
