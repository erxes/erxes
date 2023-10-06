import { Contents, HeightedWrapper } from '@erxes/ui/src/layout/styles';

import Header from '@erxes/ui/src/layout/components/Header';
import React from 'react';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import styled from 'styled-components';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { Modal } from 'react-bootstrap';
import { colors } from '@erxes/ui/src/styles';

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

  i {
    position: absolute;
    bottom: -12px;
  }
`;

const ShortcutModal = styled(Modal)`
  & > div {
    border-radius: 10px;
    overflow: hidden;
  }
`;

const ShortcutHeaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5em 0;
  border-bottom: 1px solid ${colors.borderDarker};

  h3 {
    margin: 10px;
  }
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0.75em 1em;
  border-bottom: 1px solid ${colors.borderDarker};

  p {
    color: ${colors.colorCoreBlack};
    margin: 0;
  }

  span {
    color: ${colors.colorCoreGray};
    margin-left: auto;
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
        <Tip text="Shortcut help" placement="bottom">
          <Icon
            icon="info-circle"
            size={25}
            onClick={() => modalHandler()}
            color="#9f9f9f"
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
        <ShortcutModal show={shortcutModalShow} onHide={() => modalHandler()}>
          <ShortcutHeaderWrapper>
            <h3>Shortcut help</h3>
          </ShortcutHeaderWrapper>
          <div>
            <ShortcutItem>
              <p>Resolve or open conversation</p>
              <span>ctrl + x</span>
            </ShortcutItem>
            <ShortcutItem>
              <p>Assign member to conversation</p>
              <span>ctrl + a</span>
            </ShortcutItem>
            <ShortcutItem>
              <p>Activate or deactivate internal notes</p>
              <span>ctrl + i</span>
            </ShortcutItem>
            <ShortcutItem>
              <p>Tag conversation</p>
              <span>ctrl + 1</span>
            </ShortcutItem>
            <ShortcutItem>
              <p>Convert conversation</p>
              <span>ctrl + 2</span>
            </ShortcutItem>
            <ShortcutItem>
              <p>Open response template</p>
              <span>ctrl + 3</span>
            </ShortcutItem>
          </div>
        </ShortcutModal>
      </HeightedWrapper>
    );
  }
}

export default Inbox;
