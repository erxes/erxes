import * as React from 'react';
import * as PropTypes from 'prop-types';
import { TAG_TYPES } from 'modules/tags/constants';
import { Sidebar } from 'modules/layout/components';
import { Bulk, Icon, DateFilter } from 'modules/common/components';
import { Resolver, Tagger } from 'modules/inbox/containers';
import { ConversationList } from 'modules/inbox/containers/leftSidebar';
import { PopoverButton } from 'modules/inbox/styles';
import { queries } from 'modules/inbox/graphql';
import { RightItems } from './styles';
import FilterPopover from './FilterPopover';
import StatusFilterPopover from './StatusFilterPopover';
import AssignBoxPopover from '../assignBox/AssignBoxPopover';

const propTypes = {
  currentConversationId: PropTypes.string,
  integrations: PropTypes.array.isRequired,
  queryParams: PropTypes.object,
  history: PropTypes.object
};

class LeftSidebar extends Bulk {
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
            />

            <Tagger targets={bulk} trigger={this.renderTrigger('Tag')} />
            <Resolver conversations={bulk} />
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
          queryParams={queryParams}
          searchable
        />
        <DateFilter
          queryParams={queryParams}
          history={history}
          countQuery={queries.totalConversationsCount}
          countQueryParam="conversationsTotalCount"
        />
        <StatusFilterPopover queryParams={queryParams} />
      </Sidebar.Header>
    );
  }

  renderSidebarFooter() {
    const { integrations, queryParams } = this.props;

    return (
      <Sidebar.Footer>
        <FilterPopover
          buttonText="Brand"
          query={{ queryName: 'brandList', dataName: 'brands' }}
          counts="byBrands"
          popoverTitle="Filter by brand"
          placement="top"
          queryParams={queryParams}
          paramKey="brandId"
          searchable
        />

        <FilterPopover
          buttonText="Integration"
          fields={integrations}
          queryParams={queryParams}
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
          queryParams={queryParams}
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
        <ConversationList
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

LeftSidebar.propTypes = propTypes;

LeftSidebar.contextTypes = {
  __: PropTypes.func
};

export default LeftSidebar;
