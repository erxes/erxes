import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import DateFilter from 'modules/common/components/DateFilter';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import ConversationList from 'modules/inbox/containers/leftSidebar/ConversationList';
import FilterList from 'modules/inbox/containers/leftSidebar/FilterList';
import FilterToggler from 'modules/inbox/containers/leftSidebar/FilterToggler';
import Resolver from 'modules/inbox/containers/Resolver';
import Tagger from 'modules/inbox/containers/Tagger';
import { queries } from 'modules/inbox/graphql';
import { PopoverButton } from 'modules/inbox/styles';
import Sidebar from 'modules/layout/components/Sidebar';
import { TAG_TYPES } from 'modules/tags/constants';
import React from 'react';
import RTG from 'react-transition-group';
import { IConversation } from '../../types';
import AssignBoxPopover from '../assignBox/AssignBoxPopover';
import StatusFilterPopover from './StatusFilterPopover';
import {
  AdditionalSidebar,
  DropdownWrapper,
  LeftContent,
  RightItems,
  SidebarActions
} from './styles';

type Integrations = {
  _id: string;
  name: string;
};

type Props = {
  currentUser?: IUser;
  currentConversationId?: string;
  integrations: Integrations[];
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
        <Button
          btnStyle={this.state.isOpen ? 'default' : 'simple'}
          size="small"
          onClick={this.onToggleSidebar}
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
    return <SidebarActions>{this.renderSidebarActions()}</SidebarActions>;
  }

  renderAdditionalSidebar() {
    const { integrations, queryParams } = this.props;

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
                dataName: 'channels'
              }}
              counts="byChannels"
              paramKey="channelId"
              queryParams={queryParams}
            />
          </FilterToggler>

          <FilterToggler groupText="Brands" toggleName="showBrands">
            <FilterList
              query={{ queryName: 'brandList', dataName: 'brands' }}
              counts="byBrands"
              queryParams={queryParams}
              paramKey="brandId"
            />
          </FilterToggler>

          <FilterToggler groupText="Integrations" toggleName="showIntegrations">
            <FilterList
              fields={integrations}
              queryParams={queryParams}
              counts="byIntegrationTypes"
              paramKey="integrationType"
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
              icon="tag"
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
        <AdditionalSidebar>{this.renderAdditionalSidebar()}</AdditionalSidebar>
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
