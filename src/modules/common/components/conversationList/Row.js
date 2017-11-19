import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import strip from 'strip';
import { NameCard, Label } from '../';
import {
  RowItem,
  RowContent,
  FlexContent,
  CheckBox,
  MainInfo,
  CustomerName,
  SmallText,
  MessageContent,
  AssigneeImg,
  AssigneeWrapper
} from './styles';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  channelId: PropTypes.string,
  isRead: PropTypes.bool,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  toggleBulk: PropTypes.func
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.toggleBulk = this.toggleBulk.bind(this);
    this.onClick = this.onClick.bind(this);
    this.renderCheckbox = this.renderCheckbox.bind(this);
  }

  toggleBulk(e) {
    const { toggleBulk, conversation } = this.props;
    toggleBulk(conversation, e.target.checked);
  }

  onClick(e) {
    e.preventDefault();

    const { onClick, conversation } = this.props;

    onClick(conversation);
  }

  renderCheckbox() {
    if (!this.props.toggleBulk) {
      return null;
    }

    return (
      <CheckBox>
        <input type="checkbox" onChange={this.toggleBulk} />
      </CheckBox>
    );
  }

  render() {
    const { conversation, isRead, isActive } = this.props;
    const { createdAt, content } = conversation;
    const customer = conversation.customer || {};
    const integration = conversation.integration || {};
    const brand = integration.brand || {};
    const brandName = brand.name;
    const tags = conversation.tags || [];
    const assignees = conversation.assignedUser || [];
    const details = assignees.details || [];
    const isExistingCustomer = customer && customer._id;
    return (
      <RowItem onClick={this.onClick} isActive={isActive} isRead={isRead}>
        <RowContent>
          {this.renderCheckbox()}
          <FlexContent>
            <MainInfo>
              {isExistingCustomer && (
                <NameCard.Avatar size={40} customer={customer} />
              )}
              <FlexContent>
                <CustomerName>
                  {isExistingCustomer &&
                    (customer.name || customer.email || customer.phone)}
                </CustomerName>
                <SmallText>
                  to {brandName} via {integration && integration.kind}
                </SmallText>
              </FlexContent>
            </MainInfo>
            <MessageContent>{strip(content)}</MessageContent>
            {tags.map(t => (
              <Label key={t._id} style={{ background: t.colorCode }}>
                {t.name}
              </Label>
            ))}
          </FlexContent>
        </RowContent>
        <SmallText>
          {moment(createdAt)
            .subtract(2, 'minutes')
            .fromNow()}
          <AssigneeWrapper>
            <AssigneeImg src={details.avatar} />
          </AssigneeWrapper>
        </SmallText>
      </RowItem>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
