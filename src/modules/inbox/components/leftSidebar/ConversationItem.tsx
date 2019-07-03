import moment from 'moment';
import React from 'react';
import strip from 'strip';

import { withCurrentUser } from 'modules/auth/containers';
import {
  FormControl,
  IntegrationIcon,
  NameCard,
  Tags,
  Tip
} from 'modules/common/components';

import { IUser } from '../../../auth/types';
import { ICustomer } from '../../../customers/types';
import { IBrand } from '../../../settings/brands/types';
import { IIntegration } from '../../../settings/integrations/types';
import { IConversation } from '../../types';
import {
  AssigneeImg,
  AssigneeWrapper,
  CheckBox,
  CustomerName,
  FlexContent,
  MainInfo,
  MessageContent,
  RowContent,
  RowItem,
  SmallText,
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

  renderFullName(visitor: { [key: string]: any }) {
    if (visitor.firstName || visitor.lastName) {
      return (visitor.firstName || '') + ' ' + (visitor.lastName || '');
    }

    return null;
  }

  getVisitorInfo(customer: ICustomer) {
    if (customer.visitorContactInfo) {
      const visitor = customer.visitorContactInfo;

      return this.renderFullName(visitor) || visitor.email || visitor.phone;
    }

    return null;
  }

  render() {
    const { currentUser } = this.props;
    const { conversation, isActive, selectedIds = [] } = this.props;
    const { createdAt, updatedAt, idleTime, content } = conversation;
    const customer = conversation.customer || ({} as ICustomer);
    const integration = conversation.integration || ({} as IIntegration);
    const brand = integration.brand || ({} as IBrand);
    const brandName = brand.name;
    const tags = conversation.tags || [];
    const assignedUser = conversation.assignedUser;
    const isExistingCustomer = customer && customer._id;
    const isChecked = selectedIds.includes(conversation._id);

    const isRead =
      conversation.readUserIds &&
      conversation.readUserIds.indexOf(currentUser._id) > -1;

    const isIdle =
      integration.kind !== 'form' &&
      conversation.status !== 'closed' &&
      idleTime >= 1;

    return (
      <RowItem
        onClick={this.onClick}
        isActive={isActive}
        isRead={isRead}
        isIdle={isIdle}
      >
        <RowContent isChecked={isChecked}>
          {this.renderCheckbox()}
          <FlexContent>
            <MainInfo>
              {isExistingCustomer && (
                <NameCard.Avatar
                  size={40}
                  customer={customer}
                  icon={<IntegrationIcon integration={integration} />}
                />
              )}
              <FlexContent>
                <CustomerName>
                  {isExistingCustomer &&
                    (this.renderFullName(customer) ||
                      customer.primaryEmail ||
                      customer.primaryPhone ||
                      this.getVisitorInfo(customer) ||
                      'Unnamed')}
                </CustomerName>

                <SmallTextOneLine>
                  to {brandName} via {integration && integration.kind}
                </SmallTextOneLine>
              </FlexContent>
            </MainInfo>

            <MessageContent>{strip(content)}</MessageContent>
            <Tags tags={tags} limit={3} />
          </FlexContent>
        </RowContent>

        <SmallText>
          {moment(updatedAt || createdAt).fromNow()}

          {assignedUser && (
            <AssigneeWrapper>
              <Tip
                key={assignedUser._id}
                placement="top"
                text={assignedUser.details && assignedUser.details.fullName}
              >
                <AssigneeImg
                  src={
                    assignedUser.details
                      ? assignedUser.details.avatar
                      : '/images/avatar-colored.svg'
                  }
                />
              </Tip>
            </AssigneeWrapper>
          )}
        </SmallText>
      </RowItem>
    );
  }
}

export default withCurrentUser(ConversationItem);
