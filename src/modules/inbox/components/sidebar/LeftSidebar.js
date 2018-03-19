import React from 'react';
import PropTypes from 'prop-types';
import { toggleCheckBoxes } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import {
  Bulk,
  FormControl,
  Icon,
  ConversationList,
  LoadMore,
  TaggerPopover,
  EmptyState
} from 'modules/common/components';
import { FilterPopover, StatusFilterPopover, AssignBoxPopover } from '../';
import { Resolver } from 'modules/inbox/containers';
import { PopoverButton } from '../../styles';
import { LeftItem, RightItems } from './styles';

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
  refetch: PropTypes.func,
  loading: PropTypes.bool
};

class LeftSidebar extends Bulk {
  constructor(props) {
    super(props);

    this.resetBulk = this.resetBulk.bind(this);
    this.renderTrigger = this.renderTrigger.bind(this);
  }

  refetch() {
    this.props.refetch();
  }

  resetBulk() {
    this.emptyBulk();
    toggleCheckBoxes('conversations', false);
  }

  renderTrigger(text) {
    const { __ } = this.context;
    return (
      <PopoverButton>
        {__(text)} <Icon icon="ios-arrow-down" />
      </PopoverButton>
    );
  }

  renderSidebarHeader() {
    const { channels, counts, conversations } = this.props;
    const { bulk } = this.state;
    const { __ } = this.context;

    if (bulk.length > 0) {
      return (
        <Sidebar.Header>
          <LeftItem>
            <FormControl
              componentClass="checkbox"
              onChange={() => {
                this.toggleAll(conversations, 'conversations');
              }}
            >
              {__('Select all')}
            </FormControl>
          </LeftItem>

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
          fields={channels}
          counts={counts.byChannels}
          paramKey="channelId"
          searchable
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
          searchable
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
          searchable
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
          toggleBulk={this.toggleBulk}
          bulk={this.state.bulk}
          currentConversationId={currentConversationId}
        />
        {!loading &&
          conversations.length === 0 && (
            <EmptyState
              text="There is no message."
              size="full"
              image="/images/robots/robot-02.svg"
            />
          )}
        <LoadMore all={totalCount} />
      </Sidebar>
    );
  }
}

LeftSidebar.propTypes = propTypes;
LeftSidebar.contextTypes = {
  __: PropTypes.func
};

export default LeftSidebar;
