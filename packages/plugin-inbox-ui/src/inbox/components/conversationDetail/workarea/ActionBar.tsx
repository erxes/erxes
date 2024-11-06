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
      /* webpackChunkName:"Inbox-ConvertTo" */ '../../../components/conversationDetail/workarea/ConvertTo'
    ),
  { height: '22px', width: '71px' }
);

const Post = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConvertTo" */ '../../../containers/conversationDetail/workarea/Post'
    ),
  { height: '22px', width: '71px' }
);
const PostInstagram = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConvertTo" */ '../../../containers/conversationDetail/workarea/PostIg'
    ),
  { height: '22px', width: '71px' }
);
type Props = {
  currentConversation: IConversation;
};

export default class ActionBar extends React.Component<Props> {
  render() {
    const { currentConversation } = this.props;

    const { kind } = currentConversation.integration;
    const tags = currentConversation.tags || [];
    const assignedUser = currentConversation.assignedUser;
    const participatedUsers = currentConversation.participatedUsers || [];
    const readUsers = currentConversation.readUsers || [];
    const tagTrigger = (
      <PopoverButton id='conversationTags'>
        {tags.length ? (
          <Tags
            tags={tags}
            limit={1}
          />
        ) : (
          <Label lblStyle='default'>No tags</Label>
        )}
        <Icon icon='angle-down' />
      </PopoverButton>
    );

    const assignTrigger = (
      <AssignTrigger id='conversationAssignTrigger'>
        {assignedUser && assignedUser._id ? (
          <AvatarImg src={getUserAvatar(assignedUser)} />
        ) : (
          <Button
            id='conversationAssignTo'
            btnStyle='simple'
            size='small'>
            {__('Member')}
            <Icon icon='angle-down' />
          </Button>
        )}
      </AssignTrigger>
    );

    const actionBarRight = (
      <BarItems>
        <Tagger
          targets={[currentConversation]}
          trigger={tagTrigger}
        />
        {(isEnabled('sales') ||
          isEnabled('tickets') ||
          isEnabled('tasks') ||
          isEnabled('purchases')) && (
          <ConvertTo conversation={currentConversation} />
        )}

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
          <Participators
            participatedUsers={participatedUsers}
            limit={3}
          />
        )}
        {(kind === 'facebook-messenger' || kind === 'instagram-messenger') && (
          <>
            {readUsers &&
              participatedUsers.length === 0 && ( // Check if participatedUsers is falsy
                <>
                  <Participators
                    participatedUsers={readUsers}
                    limit={3}
                  />
                </>
              )}
          </>
        )}

        {loadDynamicComponent('inboxConversationDetailActionBar', {
          conversation: currentConversation
        })}
        {kind === 'facebook-post' && (
          <Post conversation={currentConversation} />
        )}
        {kind === 'instagram-post' && (
          <PostInstagram conversation={currentConversation} />
        )}
      </ActionBarLeft>
    );

    return (
      <Wrapper.ActionBar
        right={actionBarRight}
        left={actionBarLeft}
        background='colorWhite'
      />
    );
  }
}
