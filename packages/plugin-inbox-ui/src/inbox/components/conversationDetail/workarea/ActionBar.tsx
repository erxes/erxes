import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Button from '@erxes/ui/src/components/Button';
import { AvatarImg } from '@erxes/ui/src/components/filterableList/styles';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import Tags from '@erxes/ui/src/components/Tags';
import { __, getUserAvatar } from 'coreui/utils';
import AssignBoxPopover from '../../assignBox/AssignBoxPopover';
import Resolver from '../../../containers/Resolver';
import Tagger from '../../../containers/Tagger';
import { PopoverButton } from '@erxes/ui-inbox/src/inbox/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { IConversation, IMessage } from '@erxes/ui-inbox/src/inbox/types';
import { ActionBarLeft, AssignText, AssignTrigger } from './styles';
import { isEnabled, loadDynamicComponent } from '@erxes/ui/src/utils/core';

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

export default class ActionBar extends React.Component<Props> {
  render() {
    const { currentConversation } = this.props;

    const tags = currentConversation.tags || [];
    const assignedUser = currentConversation.assignedUser;
    const participatedUsers = currentConversation.participatedUsers || [];

    const tagTrigger = (
      <PopoverButton id="conversationTags">
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
          <Tagger targets={[currentConversation]} trigger={tagTrigger} />
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
