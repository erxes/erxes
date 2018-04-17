import React from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import moment from 'moment';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { toggleCheckBoxes } from 'modules/common/utils';
import { TAG_TYPES } from 'modules/tags/constants';
import { Sidebar } from 'modules/layout/components';
import {
  Bulk,
  FormControl,
  Icon,
  ConversationList,
  LoadMore,
  TaggerPopover,
  EmptyState,
  Button
} from 'modules/common/components';
import { FilterPopover, StatusFilterPopover, AssignBoxPopover } from '../';
import { Resolver } from 'modules/inbox/containers';
import { router } from 'modules/common/utils';
import { PopoverButton } from '../../styles';
import { LeftItem, RightItems } from './styles';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  currentConversationId: PropTypes.string,
  integrations: PropTypes.array.isRequired,
  onChangeConversation: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
  refetch: PropTypes.func,
  loading: PropTypes.bool,
  queryParams: PropTypes.object,
  history: PropTypes.object
};

class LeftSidebar extends Bulk {
  constructor(props) {
    super(props);

    this.state = {
      startDate: props.queryParams.startDate
        ? moment(props.queryParams.startDate)
        : '',
      endDate: props.queryParams.endDate
        ? moment(props.queryParams.endDate)
        : '',
      bulk: [],
      showDateFilter: false
    };

    this.resetBulk = this.resetBulk.bind(this);
    this.renderTrigger = this.renderTrigger.bind(this);
    this.renderPopover = this.renderPopover.bind(this);
    this.renderDateFilter = this.renderDateFilter.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
  }

  onDateChange(type, date) {
    this.setState({ [type]: date });
  }

  refetch() {
    this.props.refetch();
  }

  resetBulk() {
    this.emptyBulk();
    toggleCheckBoxes('conversations', false);
  }

  filterByDate() {
    const { startDate, endDate } = this.state;

    const formattedStartDate = moment(startDate).format('YYYY-MM-DD HH:mm');
    const formattedEndDate = moment(endDate).format('YYYY-MM-DD HH:mm');

    router.setParams(this.props.history, {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
  }

  renderTrigger(text) {
    const { __ } = this.context;
    return (
      <PopoverButton>
        {__(text)} <Icon icon="ios-arrow-down" />
      </PopoverButton>
    );
  }

  renderPopover() {
    const { __ } = this.context;
    const props = {
      inputProps: { placeholder: __('Click to select a date') },
      timeFormat: 'HH:mm',
      dateFormat: 'YYYY/MM/DD'
    };

    return (
      <Popover id="filter-popover">
        <div style={{ display: 'inline-block' }}>
          <div style={{ display: 'block' }}>
            <Datetime
              {...props}
              value={this.state.startDate}
              onChange={date => this.onDateChange('startDate', date)}
            />
          </div>
          <div style={{ display: 'block' }}>
            <Datetime
              {...props}
              value={this.state.endDate}
              onChange={date => this.onDateChange('endDate', date)}
            />
          </div>
        </div>

        <Button onClick={() => this.filterByDate()}> ok </Button>
      </Popover>
    );
  }

  renderDateFilter() {
    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={this.renderPopover()}
        container={this}
        shouldUpdatePosition
        rootClose
      >
        <PopoverButton>
          Date <Icon icon="calendar" />
        </PopoverButton>
      </OverlayTrigger>
    );
  }

  renderSidebarHeader() {
    const { conversations } = this.props;
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
          query={{
            queryName: 'channelList',
            dataName: 'channels'
          }}
          counts="byChannels"
          paramKey="channelId"
          searchable
        />
        {this.renderDateFilter()}
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
