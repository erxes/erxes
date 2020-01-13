import { IUser } from 'modules/auth/types';
import asyncComponent from 'modules/common/components/AsyncComponent';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import FilterToggler from 'modules/inbox/containers/leftSidebar/FilterToggler';
import Resolver from 'modules/inbox/containers/Resolver';
import Tagger from 'modules/inbox/containers/Tagger';
import { queries } from 'modules/inbox/graphql';
import { PopoverButton } from 'modules/inbox/styles';
import Sidebar from 'modules/layout/components/Sidebar';
import { TAG_TYPES } from 'modules/tags/constants';
import React from 'react';
import RTG from 'react-transition-group';
import { InboxManagementActionConsumer } from '../../containers/Inbox';
import { StatusFilterPopover } from '../../containers/leftSidebar';
import { IConversation } from '../../types';
import {
  AdditionalSidebar,
  DropdownWrapper,
  LeftContent,
  RightItems,
  SidebarActions,
  ToggleButton
} from './styles';

const DateFilter = asyncComponent(
  () =>
    import(/* webpackChunkName:"Inbox-DateFilter" */ 'modules/common/components/DateFilter'),
  { height: '15px', width: '70px' }
);

const AssignBoxPopover = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-AssignBoxPopover" */ '../assignBox/AssignBoxPopover')
);

const ConversationList = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-ConversationList" */ 'modules/inbox/containers/leftSidebar/ConversationList')
);

const FilterList = asyncComponent(() =>
  import(/* webpackChunkName: "Inbox-FilterList" */ 'modules/inbox/containers/leftSidebar/FilterList')
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
        <ToggleButton isActive={this.state.isOpen} onClick={this.onToggleSidebar}>
          <Icon icon="subject" />
        </ToggleButton>
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

    return (
      <RTG.CSSTransition
        in={this.state.isOpen}
        appear={true}
        timeout={300}
        classNames="fade-in"
        unmountOnExit={true}
      >
        <div>
          <FilterToggler groupText="Channels" toggleName="showChannels">
            <FilterList
              query={{
                queryName: 'channelList',
                variables: { memberIds: [currentUser._id] },
                dataName: 'channels'
              }}
              counts="byChannels"
              paramKey="channelId"
              queryParams={queryParams}
              refetchRequired={refetchRequired}
            />
          </FilterToggler>

          <FilterToggler groupText="Brands" toggleName="showBrands">
            <FilterList
              query={{ queryName: 'brandList', dataName: 'brands' }}
              counts="byBrands"
              queryParams={queryParams}
              paramKey="brandId"
              refetchRequired={refetchRequired}
            />
          </FilterToggler>

          <FilterToggler groupText="Integrations" toggleName="showIntegrations">
            <FilterList
              query={{
                queryName: 'integrationsGetUsedTypes',
                dataName: 'integrationsGetUsedTypes'
              }}
              queryParams={queryParams}
              counts="byIntegrationTypes"
              paramKey="integrationType"
              refetchRequired={refetchRequired}
            />
          </FilterToggler>

          <FilterToggler groupText="Tags" toggleName="showTags">
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
            />
          </FilterToggler>
        </div>
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
        <Sidebar wide={true} full={true} header={this.renderSidebarHeader()}>
          <ConversationList
            currentUser={currentUser}
            currentConversationId={currentConversationId}
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
