import { Button, DateFilter, Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Resolver, Tagger } from 'modules/inbox/containers';
import { ConversationList } from 'modules/inbox/containers/leftSidebar';
import { queries } from 'modules/inbox/graphql';
import { PopoverButton } from 'modules/inbox/styles';
import { Sidebar } from 'modules/layout/components';
import { TAG_TYPES } from 'modules/tags/constants';
import * as React from 'react';
import { IConversation } from '../../types';
import AssignBoxPopover from '../assignBox/AssignBoxPopover';
import { FilterGroup, StatusFilterPopover } from './';
import {
  AdditionalSidebar,
  DropdownWrapper,
  LeftContent,
  RightItems
} from './styles';

type Integrations = {
  _id: string;
  name: string;
};

type Props = {
  currentConversationId?: string;
  integrations: Integrations[];
  queryParams: any;
  history: any;
  totalCount: any;

  bulk: IConversation[];
  toggleBulk: (target: IConversation[], toggleAdd: boolean) => void;
  emptyBulk: () => void;
  config: { [key: string]: boolean };
  toggle: (params: { name: string; isOpen: boolean }) => void;
};

type State = {
  isOpen: boolean;
};

class LeftSidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.config.showAddition
    };
  }

  renderTrigger(text: string) {
    return (
      <PopoverButton>
        {__(text)} <Icon icon="downarrow" />
      </PopoverButton>
    );
  }

  onToggle = () => {
    const { toggle } = this.props;
    const { isOpen } = this.state;

    this.setState({ isOpen: !isOpen });

    toggle({ name: 'showAddition', isOpen: !isOpen });
  };

  renderSidebarActions() {
    const { queryParams, history, bulk, emptyBulk } = this.props;

    if (bulk.length > 0) {
      return (
        <Sidebar.Header>
          <RightItems>
            <AssignBoxPopover
              targets={bulk}
              trigger={this.renderTrigger('Assign')}
            />

            <Tagger targets={bulk} trigger={this.renderTrigger('Tag')} />
            <Resolver conversations={bulk} emptyBulk={emptyBulk} />
          </RightItems>
        </Sidebar.Header>
      );
    }

    return (
      <Sidebar.Header>
        <Button
          btnStyle="simple"
          size="small"
          onClick={this.onToggle}
          icon="levels"
        />
        <DropdownWrapper>
          <DateFilter
            queryParams={queryParams}
            history={history}
            countQuery={queries.totalConversationsCount}
            countQueryParam="conversationsTotalCount"
          />
          <StatusFilterPopover queryParams={queryParams} history={history} />
        </DropdownWrapper>
      </Sidebar.Header>
    );
  }

  renderSidebarHeader() {
    return <React.Fragment>{this.renderSidebarActions()}</React.Fragment>;
  }

  renderAdditionalSidebar() {
    const { integrations, queryParams, config, toggle } = this.props;

    if (!this.state.isOpen) {
      return null;
    }

    return (
      <>
        <FilterGroup
          isOpen={config.showChannels}
          toggleName="showChannels"
          toggle={toggle}
          groupText="Channels"
          query={{
            queryName: 'channelList',
            dataName: 'channels'
          }}
          counts="byChannels"
          paramKey="channelId"
          queryParams={queryParams}
        />

        <FilterGroup
          isOpen={config.showBrands}
          toggleName="showBrands"
          toggle={toggle}
          groupText="Brands"
          query={{ queryName: 'brandList', dataName: 'brands' }}
          counts="byBrands"
          queryParams={queryParams}
          paramKey="brandId"
        />

        <FilterGroup
          isOpen={config.showIntegrations}
          toggleName="showIntegrations"
          toggle={toggle}
          groupText="Integrations"
          fields={integrations}
          queryParams={queryParams}
          counts="byIntegrationTypes"
          paramKey="integrationType"
        />

        <FilterGroup
          isOpen={config.showTags}
          toggleName="showTags"
          toggle={toggle}
          groupText="Tags"
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
          icon="tag"
        />
      </>
    );
  }

  render() {
    const {
      totalCount,
      currentConversationId,
      history,
      queryParams,
      bulk,
      toggleBulk
    } = this.props;

    return (
      <LeftContent isOpen={this.state.isOpen}>
        <AdditionalSidebar>{this.renderAdditionalSidebar()}</AdditionalSidebar>
        <Sidebar wide={true} full={true} header={this.renderSidebarHeader()}>
          <ConversationList
            currentConversationId={currentConversationId}
            totalCount={totalCount}
            history={history}
            queryParams={queryParams}
            toggleRowCheckbox={toggleBulk}
            selectedConversations={bulk}
          />
        </Sidebar>
      </LeftContent>
    );
  }
}

export default LeftSidebar;
