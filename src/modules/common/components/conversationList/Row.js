import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import strip from 'strip';
import { NameCard, FormControl, Tags } from '../';
import {
  RowItem,
  RowContent,
  FlexContent,
  CheckBox,
  MainInfo,
  CustomerName,
  SmallText,
  SmallTextOneLine,
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
  toggleBulk: PropTypes.func,
  bulk: PropTypes.array
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.toggleBulk = this.toggleBulk.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onClickCheckBox = this.onClickCheckBox.bind(this);
    this.renderCheckbox = this.renderCheckbox.bind(this);
    this.renderFullName = this.renderFullName.bind(this);
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
      <CheckBox onClick={this.onClickCheckBox}>
        <FormControl componentClass="checkbox" onChange={this.toggleBulk} />
      </CheckBox>
    );
  }

  onClickCheckBox(e) {
    e.stopPropagation();
  }

  renderFullName(customer) {
    if (customer.firstName || customer.lastName) {
      return (customer.firstName || '') + ' ' + (customer.lastName || '');
    }
    return null;
  }

  render() {
    const { conversation, isRead, isActive, bulk } = this.props;
    const { createdAt, content } = conversation;
    const customer = conversation.customer || {};
    const integration = conversation.integration || {};
    const brand = integration.brand || {};
    const brandName = brand.name;
    const tags = conversation.tags || [];
    const assignedUser = conversation.assignedUser;
    const isExistingCustomer = customer && customer._id;

    return (
      <RowItem onClick={this.onClick} isActive={isActive} isRead={isRead}>
        <RowContent
          isChecked={
            bulk
              .map(e => {
                return e._id;
              })
              .indexOf(conversation._id) > -1
          }
        >
          {this.renderCheckbox()}
          <FlexContent>
            <MainInfo>
              {isExistingCustomer && (
                <NameCard.Avatar size={40} customer={customer} />
              )}
              <FlexContent>
                <CustomerName>
                  {isExistingCustomer &&
                    (customer.name ||
                      this.renderFullName(customer) ||
                      customer.email ||
                      customer.phone ||
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
          {moment(createdAt)
            .subtract(2, 'minutes')
            .fromNow()}
          {assignedUser && (
            <AssigneeWrapper>
              <AssigneeImg
                src={
                  assignedUser.details.avatar || '/images/avatar-colored.png'
                }
              />
            </AssigneeWrapper>
          )}
        </SmallText>
      </RowItem>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
