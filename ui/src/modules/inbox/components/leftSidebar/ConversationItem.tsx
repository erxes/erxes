import dayjs from 'dayjs';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import FormControl from 'modules/common/components/form/Control';
import IntegrationIcon from 'modules/common/components/IntegrationIcon';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tags from 'modules/common/components/Tags';
import Tip from 'modules/common/components/Tip';
import { renderFullName, readFile } from 'modules/common/utils';
import { CallLabel } from 'modules/inbox/styles';
import { cleanIntegrationKind } from 'modules/settings/integrations/containers/utils';
import React from 'react';
import strip from 'strip';
import { IUser } from '../../../auth/types';
import { ICustomer } from '../../../customers/types';
import { IBrand } from '../../../settings/brands/types';
import { IIntegration } from '../../../settings/integrations/types';
import { IConversation } from '../../types';
import {
  AssigneeImg,
  CheckBox,
  Count,
  CustomerName,
  FlexContent,
  FlexRoot,
  FlexWidth,
  Idle,
  MainInfo,
  MessageContent,
  RowContent,
  RowItem,
  SmallTextOneLine
} from './styles';

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
                  <FlexWidth>
                    {isExistingCustomer && renderFullName(customer)}
                  </FlexWidth>
                  <time>{dayjs(updatedAt || createdAt).fromNow(true)}</time>
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
              <FlexWidth>
                {this.showMessageContent(integration.kind, content || '')}
              </FlexWidth>
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
