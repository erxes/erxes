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
  DataWithLoader
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
    return (
      <PopoverButton>
        {text} <Icon icon="ios-arrow-down" />
      </PopoverButton>
    );
  }

  renderSidebarHeader() {
    const { channels, counts, conversations } = this.props;
    const { bulk } = this.state;

    if (bulk.length > 0) {
      return (
        <Sidebar.Header>
          <LeftItem>
            <FormControl
              componentClass="checkbox"
              onChange={() => {
                this.toggleAll(conversations, 'conversations');
              }}
            />
            Select all
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
        <DataWithLoader
          data={
            <ConversationList
              conversations={conversations}
              onRowClick={onChangeConversation}
              toggleBulk={this.toggleBulk}
              bulk={this.state.bulk}
              currentConversationId={currentConversationId}
            />
          }
          loading={loading}
          count={conversations.length}
          emptyText="There is no message."
          emptyImage="/images/robots/robot-02.svg"
        />
        <LoadMore all={totalCount} />
      </Sidebar>
    );
  }
}

LeftSidebar.propTypes = propTypes;

export default LeftSidebar;
