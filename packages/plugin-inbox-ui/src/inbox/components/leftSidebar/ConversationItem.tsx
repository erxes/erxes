import * as dayjs from 'dayjs';

import {
  AssigneeImg,
  CheckBox,
  Count,
  FlexContent,
  Idle,
  MainInfo,
  MessageContent,
  RowContent,
  RowItem,
  SmallTextOneLine
} from './styles';
import {
  CustomerName,
  EllipsisContent,
  Flex as FlexRoot
} from '@erxes/ui/src/styles/main';
import {
  cleanIntegrationKind,
  readFile,
  renderFullName
} from '@erxes/ui/src/utils';

import { CallLabel } from '@erxes/ui-inbox/src/inbox/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IIntegration } from '../../../settings/integrations/types';
import { IUser } from '@erxes/ui/src/auth/types';
import IntegrationIcon from '../../../settings/integrations/components/IntegrationIcon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import React from 'react';
import Tags from '@erxes/ui/src/components/Tags';
import Tip from '@erxes/ui/src/components/Tip';
import strip from 'strip';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

type Props = {
  conversation: IConversation;
  channelId?: string;
  isActive: boolean;
  onClick: (conversation: IConversation) => void;
  toggleCheckbox: (conversation: IConversation, checked: boolean) => void;
  selectedIds?: string[];
  currentUser: IUser;
};

class ConversationItem extends React.Component<Props> {
  toggleCheckbox = (e: React.FormEvent<HTMLElement>) => {
    const { toggleCheckbox, conversation } = this.props;

    toggleCheckbox(conversation, (e.target as HTMLInputElement).checked);
  };

  onClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const { onClick, conversation } = this.props;

    onClick(conversation);
  };

  renderCheckbox() {
    if (!this.props.toggleCheckbox) {
      return null;
    }

    return (
      <CheckBox onClick={this.onClickCheckBox}>
        <FormControl componentClass="checkbox" onChange={this.toggleCheckbox} />
      </CheckBox>
    );
  }

  onClickCheckBox = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  isIdle = (integration: IIntegration, idleTime: number) => {
    const kind = integration.kind;

    if (
      kind === 'form' ||
      kind.includes('nylas') ||
      kind === 'gmail' ||
      this.props.conversation.status === 'closed'
    ) {
      return false;
    }

    // become idle in 3 minutes
    return idleTime >= 3;
  };

  showMessageContent(kind: string, content: string) {
    if (kind === 'callpro') {
      return (
        <CallLabel type={(content || '').toLocaleLowerCase()}>
          {content}
        </CallLabel>
      );
    }

    return strip(content);
  }

  render() {
    const { currentUser } = this.props;
    const { conversation, isActive, selectedIds = [] } = this.props;
    const { createdAt, updatedAt, idleTime, content } = conversation;
    const customer = conversation.customer || ({} as ICustomer);
    const integration = conversation.integration || ({} as IIntegration);
    const brand = integration.brand || ({} as IBrand);
    const tags = conversation.tags || [];
    const assignedUser = conversation.assignedUser;
    const isExistingCustomer = customer && customer._id;
    const isChecked = selectedIds.includes(conversation._id);
    const messageCount = conversation.messageCount || 0;

    const isRead =
      conversation.readUserIds &&
      conversation.readUserIds.indexOf(currentUser._id) > -1;

    return (
      <RowItem onClick={this.onClick} isActive={isActive} isRead={isRead}>
        <RowContent isChecked={isChecked}>
          {this.renderCheckbox()}
          <FlexContent>
            <MainInfo>
              {isExistingCustomer && (
                <NameCard.Avatar
                  size={36}
                  letterCount={1}
                  customer={customer}
                  icon={<IntegrationIcon integration={integration} />}
                />
              )}
              <FlexContent>
                <CustomerName>
                  <EllipsisContent>
                    {isExistingCustomer && renderFullName(customer)}
                  </EllipsisContent>
                  <time>
                    {(dayjs(updatedAt || createdAt) || ({} as any)).fromNow(
                      true
                    )}
                  </time>
                </CustomerName>

                <SmallTextOneLine>
                  to {brand.name} via{' '}
                  {integration.kind === 'callpro'
                    ? integration.name
                    : cleanIntegrationKind(integration && integration.kind)}
                </SmallTextOneLine>
              </FlexContent>
            </MainInfo>

            <MessageContent>
              <EllipsisContent>
                {this.showMessageContent(integration.kind, content || '')}
              </EllipsisContent>
              <FlexRoot>
                {messageCount > 1 && <Count>{messageCount}</Count>}
                {assignedUser && (
                  <Tip
                    key={assignedUser._id}
                    placement="top"
                    text={assignedUser.details && assignedUser.details.fullName}
                  >
                    <AssigneeImg
                      src={
                        assignedUser.details &&
                        (assignedUser.details.avatar
                          ? readFile(assignedUser.details.avatar)
                          : '/images/avatar-colored.svg')
                      }
                    />
                  </Tip>
                )}
              </FlexRoot>
            </MessageContent>
            <Tags tags={tags} limit={3} />
          </FlexContent>
        </RowContent>
        {this.isIdle(integration, idleTime) && (
          <Tip placement="left" text="Idle">
            <Idle />
          </Tip>
        )}
      </RowItem>
    );
  }
}

export default withCurrentUser(ConversationItem);
