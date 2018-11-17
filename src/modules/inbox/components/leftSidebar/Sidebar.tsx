import { DateFilter, Icon } from 'modules/common/components';
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
import FilterPopover from './FilterPopover';
import StatusFilterPopover from './StatusFilterPopover';
import { AdditionalSidebar, RightItems } from './styles';

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
};

class LeftSidebar extends React.Component<Props, {}> {
  renderTrigger(text: string) {
    return (
      <PopoverButton>
        {__(text)} <Icon icon="downarrow" />
      </PopoverButton>
    );
  }

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
        <DateFilter
          queryParams={queryParams}
          history={history}
          countQuery={queries.totalConversationsCount}
          countQueryParam="conversationsTotalCount"
        />
        <StatusFilterPopover queryParams={queryParams} history={history} />
      </Sidebar.Header>
    );
  }

  renderSidebarHeader() {
    return <React.Fragment>{this.renderSidebarActions()}</React.Fragment>;
  }

  renderAdditionalSidebar() {
    const { integrations, queryParams } = this.props;

    return (
      <AdditionalSidebar>
        <FilterPopover
          groupText="Channels"
          query={{
            queryName: 'channelList',
            dataName: 'channels'
          }}
          counts="byChannels"
          paramKey="channelId"
          queryParams={queryParams}
        />
        <FilterPopover
          groupText="Brands"
          query={{ queryName: 'brandList', dataName: 'brands' }}
          counts="byBrands"
          queryParams={queryParams}
          paramKey="brandId"
        />

        <FilterPopover
          groupText="Integrations"
          fields={integrations}
          queryParams={queryParams}
          counts="byIntegrationTypes"
          paramKey="integrationType"
        />

        <FilterPopover
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
      </AdditionalSidebar>
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
      <>
        {this.renderAdditionalSidebar()}
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
      </>
    );
  }
}

export default LeftSidebar;
