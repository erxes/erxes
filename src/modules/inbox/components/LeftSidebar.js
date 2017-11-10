import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Wrapper } from 'modules/layout/components';
import { ConversationList, Icon } from 'modules/common/components';
import FilterPopover from './FilterPopover';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  channels: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
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

        <div>
          Open <Icon icon="ios-arrow-down" />
        </div>
      </Wrapper.Sidebar.Header>
    );
  }

  renderSidebarFooter() {
    const { brands, tags, counts } = this.props;

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

        <div>
          Integration <Icon icon="ios-arrow-down" />
        </div>

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
    const { conversations, onChangeConversation } = this.props;

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
          onRowClick={onChangeConversation}
        />
      </Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
