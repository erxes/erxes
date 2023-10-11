import { ActionBarLeft, AssignText, AssignTrigger } from './styles';
import { __, getUserAvatar } from 'coreui/utils';
import { isEnabled, loadDynamicComponent } from '@erxes/ui/src/utils/core';

import AssignBoxPopover from '../../assignBox/AssignBoxPopover';
import { AvatarImg } from '@erxes/ui/src/components/filterableList/styles';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import { PopoverButton } from '@erxes/ui-inbox/src/inbox/styles';
import React from 'react';
import Resolver from '../../../containers/Resolver';
import Tagger from '../../../containers/Tagger';
import Tags from '@erxes/ui/src/components/Tags';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const Participators = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Participators" */ '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/Participators'
    ),
  { height: '30px', width: '30px', round: true }
);

const ConvertTo = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConvertTo" */ '../../../containers/conversationDetail/workarea/ConvertTo'
    ),
  { height: '22px', width: '71px' }
);

type Props = {
  currentConversation: IConversation;
};

type State = {
  keysPressed: any;
  disableTreeView: boolean;
};

export default class ActionBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      keysPressed: {},
      disableTreeView: false
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (event: any) => {
    const { keysPressed } = this.state;
    const key = event.key;
    const assignElement = document.getElementById('conversationAssignTrigger');
    const tagElement = document.getElementById('conversationTags');
    const shortcutElement = document.getElementById('help-shortcuts');

    this.setState({ keysPressed: { ...keysPressed, [key]: true } }, () => {
      if (
        this.state.keysPressed.Control === true &&
        this.state.keysPressed.a === true &&
        assignElement
      ) {
        assignElement.click();
      }
      if (
        this.state.keysPressed.Control === true &&
        event.keyCode === 49 &&
        tagElement
      ) {
        tagElement.click();
        this.setState({ disableTreeView: true });
      }
      if (
        this.state.keysPressed.Control === true &&
        this.state.keysPressed.k === true &&
        shortcutElement
      ) {
        shortcutElement.click();
        this.setState({ disableTreeView: true });
      }
    });
  };

  handleKeyUp = (event: any) => {
    delete this.state.keysPressed[event.key];

    this.setState({ keysPressed: { ...this.state.keysPressed } });
  };

  render() {
    const { currentConversation } = this.props;

    const tags = currentConversation.tags || [];
    const assignedUser = currentConversation.assignedUser;
    const participatedUsers = currentConversation.participatedUsers || [];

    const tagTrigger = (
      <PopoverButton
        id="conversationTags"
        onClick={() => this.setState({ disableTreeView: false })}
      >
        {tags.length ? (
          <Tags tags={tags} limit={1} />
        ) : (
          <Label lblStyle="default">No tags</Label>
        )}
        <Icon icon="angle-down" />
      </PopoverButton>
    );

    const assignTrigger = (
      <AssignTrigger id="conversationAssignTrigger">
        {assignedUser && assignedUser._id ? (
          <AvatarImg src={getUserAvatar(assignedUser)} />
        ) : (
          <Button id="conversationAssignTo" btnStyle="simple" size="small">
            {__('Member')}
            <Icon icon="angle-down" />
          </Button>
        )}
      </AssignTrigger>
    );

    const actionBarRight = (
      <BarItems>
        {isEnabled('tags') && (
          <Tagger
            targets={[currentConversation]}
            trigger={tagTrigger}
            disableTreeView={this.state.disableTreeView}
          />
        )}
        {isEnabled('cards') && <ConvertTo conversation={currentConversation} />}

        <Resolver conversations={[currentConversation]} />
      </BarItems>
    );

    const actionBarLeft = (
      <ActionBarLeft>
        <AssignText>{__('Assign to')}:</AssignText>
        <AssignBoxPopover
          targets={[currentConversation]}
          trigger={assignTrigger}
        />
        {participatedUsers && (
          <Participators participatedUsers={participatedUsers} limit={3} />
        )}

        {loadDynamicComponent('inboxConversationDetailActionBar', {
          conversation: currentConversation
        })}
      </ActionBarLeft>
    );

    return (
      <Wrapper.ActionBar
        right={actionBarRight}
        left={actionBarLeft}
        background="colorWhite"
      />
    );
  }
}
