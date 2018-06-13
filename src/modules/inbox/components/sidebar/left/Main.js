import React from 'react';
import PropTypes from 'prop-types';
import { TAG_TYPES } from 'modules/tags/constants';
import { Sidebar } from 'modules/layout/components';
import {
  Bulk,
  Icon,
  TaggerPopover,
  DateFilter
} from 'modules/common/components';
import { Resolver, LeftSidebarContent } from 'modules/inbox/containers';
import { PopoverButton } from '../../../styles';
import { RightItems } from '../styles';
import { queries } from '../../../graphql';
import FilterPopover from './FilterPopover';
import StatusFilterPopover from './StatusFilterPopover';
import AssignBoxPopover from '../../assignBox/AssignBoxPopover';

const propTypes = {
  currentConversationId: PropTypes.string,
  integrations: PropTypes.array.isRequired,
  queryParams: PropTypes.object,
  history: PropTypes.object
};

class Main extends Bulk {
  renderTrigger(text) {
    const { __ } = this.context;

    return (
      <PopoverButton>
        {__(text)} <Icon icon="downarrow" />
      </PopoverButton>
    );
  }

  renderSidebarHeader() {
    const { queryParams, history } = this.props;
    const { bulk } = this.state;

    if (bulk.length > 0) {
      return (
        <Sidebar.Header>
          <RightItems>
            <AssignBoxPopover
              targets={bulk}
              trigger={this.renderTrigger('Assign')}
              afterSave={this.resetBulk}
            />

            <TaggerPopover
              targets={bulk}
              type="conversation"
              trigger={this.renderTrigger('Tag')}
              afterSave={this.resetBulk}
            />
            <Resolver conversations={bulk} afterResolve={this.resetBulk} />
          </RightItems>
        </Sidebar.Header>
      );
    }

    return (
      <Sidebar.Header>
        <FilterPopover
          buttonText="# Channel"
          popoverTitle="Filter by channel"
          query={{
            queryName: 'channelList',
            dataName: 'channels'
          }}
          counts="byChannels"
          paramKey="channelId"
          searchable
        />
        <DateFilter
          queryParams={queryParams}
          history={history}
          countQuery={queries.totalConversationsCount}
          countQueryParam="conversationsTotalCount"
        />
        <StatusFilterPopover />
      </Sidebar.Header>
    );
  }

  renderSidebarFooter() {
    const { integrations } = this.props;

    return (
      <Sidebar.Footer>
        <FilterPopover
          buttonText="Brand"
          query={{ queryName: 'brandList', dataName: 'brands' }}
          counts="byBrands"
          popoverTitle="Filter by brand"
          placement="top"
          paramKey="brandId"
          searchable
        />

        <FilterPopover
          buttonText="Integration"
          fields={integrations}
          counts="byIntegrationTypes"
          paramKey="integrationType"
          popoverTitle="Filter by integrations"
          placement="top"
        />

        <FilterPopover
          buttonText="Tag"
          query={{
            queryName: 'tagList',
            dataName: 'tags',
            variables: {
              type: TAG_TYPES.CONVERSATION
            }
          }}
          counts="byTags"
          paramKey="tag"
          popoverTitle="Filter by tag"
          placement="top"
          icon="tag"
          searchable
        />
      </Sidebar.Footer>
    );
  }

  render() {
    const {
      totalCount,
      currentConversationId,
      history,
      queryParams
    } = this.props;
    const { bulk } = this.state;

    return (
      <Sidebar
        wide
        full
        header={this.renderSidebarHeader()}
        footer={this.renderSidebarFooter()}
      >
        <LeftSidebarContent
          currentConversationId={currentConversationId}
          totalCount={totalCount}
          history={history}
          queryParams={queryParams}
          toggleRowCheckbox={this.toggleBulk}
          selectedIds={bulk}
        />
      </Sidebar>
    );
  }
}

Main.propTypes = propTypes;

Main.contextTypes = {
  __: PropTypes.func
};

export default Main;
