import { Contents, HeightedWrapper } from '@erxes/ui/src/layout/styles';
import { colors, dimensions } from '@erxes/ui/src/styles';

import Header from '@erxes/ui/src/layout/components/Header';
import Icon from '@erxes/ui/src/components/Icon';
import { Modal } from 'react-bootstrap';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

const ShortcutModal = styledTS<{ show?: boolean; onHide? }>(styled(Modal))`
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

  h4 {
    margin: 10px;
  }
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
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
        <ShortcutModal show={shortcutModalShow} onHide={() => modalHandler()}>
          <ShortcutHeaderWrapper>
            <h4>Help keyboard shortcuts</h4>
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
