import {
  AdditionalSidebar,
  DropdownWrapper,
  FlexCenter,
  LeftContent,
  RightItems,
  ScrollContent,
  SidebarActions,
  SidebarContent,
  ToggleButton
} from './styles';

import Button from '@erxes/ui/src/components/Button';
import { CONVERSATION_STATUSES } from '../../constants';
import FilterToggler from '../../containers/leftSidebar/FilterToggler';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import { InboxManagementActionConsumer } from '../../containers/InboxCore';
import { IntegrationModal } from './IntegrationModal';
import { PopoverButton } from '@erxes/ui-inbox/src/inbox/styles';
import RTG from 'react-transition-group';
import React from 'react';
import Resolver from '../../containers/Resolver';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { StatusFilterPopover } from '../../containers/leftSidebar';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import Tagger from '../../containers/Tagger';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { queries } from '@erxes/ui-inbox/src/inbox/graphql';

const DateFilter = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-DateFilter" */ '@erxes/ui/src/components/DateFilter'
    ),
  { height: '15px', width: '70px' }
);

const AssignBoxPopover = asyncComponent(() =>
  import(
    /* webpackChunkName:"Inbox-AssignBoxPopover" */ '../assignBox/AssignBoxPopover'
  )
);

const ConversationList = asyncComponent(() =>
  import(
    /* webpackChunkName:"Inbox-ConversationList" */ '../../containers/leftSidebar/ConversationList'
  )
);

const FilterList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Inbox-FilterList" */ '../../containers/leftSidebar/FilterList'
  )
);

type Props = {
  currentUser?: IUser;
  currentConversationId?: string;
  queryParams: any;
  history: any;
  bulk: IConversation[];
  toggleBulk: (target: IConversation[], toggleAdd: boolean) => void;
  emptyBulk: () => void;
  config: { [key: string]: boolean };
  toggleSidebar: (params: { isOpen: boolean }) => void;
  resolveAll: () => void;
};

type State = {
  isOpen: boolean;
  counts?: any;
};

class LeftSidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.config.showAddition,
      counts: {}
    };
  }

  renderTrigger(text: string) {
    return (
      <PopoverButton>
        {__(text)} <Icon icon="angle-down" />
      </PopoverButton>
    );
  }

  onToggleSidebar = () => {
    const { toggleSidebar } = this.props;
    const { isOpen } = this.state;

    this.setState({ isOpen: !isOpen });
    toggleSidebar({ isOpen: !isOpen });
  };

  renderSidebarActions() {
    const { queryParams, history, bulk, emptyBulk } = this.props;

    if (bulk.length > 0) {
      return (
        <Sidebar.Header>
          <Resolver conversations={bulk} emptyBulk={emptyBulk} />
          <RightItems>
            <AssignBoxPopover
              targets={bulk}
              trigger={this.renderTrigger('Assign')}
            />

            <Tagger targets={bulk} trigger={this.renderTrigger('Tag')} />
          </RightItems>
        </Sidebar.Header>
      );
    }

    return (
      <Sidebar.Header>
        <FlexCenter>
          <ToggleButton
            id="btn-inbox-channel-visible"
            isActive={this.state.isOpen}
            onClick={this.onToggleSidebar}
          >
            <Icon icon="subject" />
          </ToggleButton>
          {queryParams.status !== CONVERSATION_STATUSES.CLOSED && (
            <Button
              size="small"
              btnStyle="simple"
              onClick={this.props.resolveAll}
            >
              Resolve all
            </Button>
          )}
        </FlexCenter>
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
    return <SidebarActions>{this.renderSidebarActions()}</SidebarActions>;
  }

  renderAdditionalSidebar(refetchRequired: string) {
    const { queryParams, currentUser } = this.props;

    if (!currentUser) {
      return null;
    }

    const setCounts = (counts: any) => {
      const current = { ...this.state.counts };

      this.setState({ counts: { ...current, ...counts } });
    };

    return (
      <RTG.CSSTransition
        in={this.state.isOpen}
        appear={true}
        timeout={300}
        classNames="fade-in"
        unmountOnExit={true}
      >
        <SidebarContent>
          <ScrollContent>
            <FilterToggler
              groupText="Channels"
              toggleName="showChannels"
              manageUrl="/settings/channels"
            >
              <FilterList
                query={{
                  queryName: 'channelsByMembers',
                  variables: { memberIds: [currentUser._id] },
                  dataName: 'channelsByMembers'
                }}
                counts="byChannels"
                paramKey="channelId"
                queryParams={queryParams}
                refetchRequired={refetchRequired}
                setCounts={setCounts}
              />
            </FilterToggler>

            {isEnabled('segments') && (
              <FilterToggler
                groupText="Segments"
                toggleName="showSegments"
                manageUrl="/segments?contentType=inbox:conversation"
              >
                <FilterList
                  query={{
                    queryName: 'segmentList',
                    dataName: 'segments',
                    variables: {
                      contentTypes: [TAG_TYPES.CONVERSATION]
                    }
                  }}
                  queryParams={queryParams}
                  counts="bySegment"
                  paramKey="segment"
                  icon="tag-alt"
                  refetchRequired={refetchRequired}
                  treeView={true}
                  setCounts={setCounts}
                />
              </FilterToggler>
            )}

            <FilterToggler
              groupText="Brands"
              toggleName="showBrands"
              manageUrl="/settings/brands"
            >
              <FilterList
                query={{ queryName: 'allBrands', dataName: 'allBrands' }}
                counts="byBrands"
                queryParams={queryParams}
                paramKey="brandId"
                refetchRequired={refetchRequired}
                setCounts={setCounts}
              />
            </FilterToggler>

            <FilterToggler
              groupText="Integrations"
              toggleName="showIntegrations"
              manageUrl="/settings/add-ons"
            >
              <FilterList
                query={{
                  queryName: 'integrationsGetUsedTypes',
                  dataName: 'integrationsGetUsedTypes'
                }}
                queryParams={queryParams}
                counts="byIntegrationTypes"
                paramKey="integrationType"
                refetchRequired={refetchRequired}
                setCounts={setCounts}
              />
            </FilterToggler>

            {isEnabled('tags') && (
              <FilterToggler
                groupText="Tags"
                toggleName="showTags"
                manageUrl="/tags/inbox:conversation"
              >
                <FilterList
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
                  icon="tag-alt"
                  refetchRequired={refetchRequired}
                  multiple={true}
                  treeView={true}
                  setCounts={setCounts}
                />
              </FilterToggler>
            )}
          </ScrollContent>
          <IntegrationModal />
        </SidebarContent>
      </RTG.CSSTransition>
    );
  }

  render() {
    const {
      currentUser,
      currentConversationId,
      history,
      queryParams,
      bulk,
      toggleBulk
    } = this.props;

    return (
      <LeftContent isOpen={this.state.isOpen}>
        <InboxManagementActionConsumer>
          {({ refetchRequired }) => (
            <AdditionalSidebar>
              {this.renderAdditionalSidebar(refetchRequired)}
            </AdditionalSidebar>
          )}
        </InboxManagementActionConsumer>
        <Sidebar
          wide={true}
          full={true}
          header={this.renderSidebarHeader()}
          hasBorder
        >
          <ConversationList
            currentUser={currentUser}
            currentConversationId={currentConversationId}
            history={history}
            queryParams={queryParams}
            toggleRowCheckbox={toggleBulk}
            selectedConversations={bulk}
            counts={this.state.counts}
          />
        </Sidebar>
      </LeftContent>
    );
  }
}

export default LeftSidebar;
