import { Contents, HeightedWrapper } from '@erxes/ui/src/layout/styles';

import Header from '@erxes/ui/src/layout/components/Header';
import Icon from '@erxes/ui/src/components/Icon';
import InboxShortCuts from './InboxShortCuts';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import styled from 'styled-components';

const Sidebar = asyncComponent(() =>
  import(
    /* webpackChunkName:"Inbox-Sidebar" */ '../containers/leftSidebar/Sidebar'
  )
);

const ConversationDetail = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConversationDetail" */ '../containers/conversationDetail/ConversationDetail'
    ),
  { height: 'auto', width: '100%', color: '#fff', margin: '10px 10px 10px 0' }
);

const AdditionalMenu = styled.div`
  cursor: pointer;
  display: inline-flex;
  position: relative;
  margin-bottom: 3px;

  i {
    margin-right: 10px;
  }
`;

type Props = {
  queryParams: any;
  currentConversationId: string;
};

type State = {
  shortcutModalShow: boolean;
};

class Inbox extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      shortcutModalShow: false
    };
  }

  render() {
    const { currentConversationId, queryParams } = this.props;
    const { shortcutModalShow } = this.state;

    const menuInbox = [{ title: 'Team Inbox', link: '/inbox/index' }];

    const modalHandler = () => {
      this.setState({ shortcutModalShow: !shortcutModalShow });
    };

    const shortcutHelp = (
      <AdditionalMenu>
        <Tip text="Help shortcuts (Ctrl + K)" placement="bottom">
          <Icon
            icon="keyboard-alt"
            size={18}
            onClick={() => modalHandler()}
            color="#9f9f9f"
            id="help-shortcuts"
          />
        </Tip>
      </AdditionalMenu>
    );

    return (
      <HeightedWrapper>
        <Header
          title={'Conversation'}
          queryParams={queryParams}
          submenu={menuInbox}
          additionalMenuItem={shortcutHelp}
        />
        <Contents>
          <Sidebar
            queryParams={queryParams}
            currentConversationId={currentConversationId}
          />
          <ConversationDetail currentId={currentConversationId} />
        </Contents>
        <InboxShortCuts
          shortcutModalShow={shortcutModalShow}
          modalHandler={modalHandler}
        />
      </HeightedWrapper>
    );
  }
}

export default Inbox;
