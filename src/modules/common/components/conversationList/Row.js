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
  MessageContent
} from './styles';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  channelId: PropTypes.string,
  isRead: PropTypes.bool,
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

  componentWillMount() {
    moment.updateLocale('en', {
      relativeTime: {
        future: 'in %s',
        past: '%s ',
        s: 's',
        m: 'm',
        mm: '%d m',
        h: 'h',
        hh: '%d h',
        d: 'd',
        dd: '%d d',
        M: 'a mth',
        MM: '%d mths',
        y: 'y',
        yy: '%d y'
      }
    });
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
    const { conversation, isRead } = this.props;
    const { createdAt, content } = conversation;
    const customer = conversation.customer || {};
    const integration = conversation.integration || {};
    const brand = integration.brand || {};
    const brandName = brand.name;
    const isExistingCustomer = customer && customer._id;

    // for testing purpose
    const user = conversation.user;

    return (
      <RowItem isRead={isRead} onClick={this.onClick}>
        <RowContent>
          {this.renderCheckbox()}
          <FlexContent>
            <MainInfo>
              {(isExistingCustomer && customer.name) ||
              (isExistingCustomer && customer.email) ||
              (isExistingCustomer && customer.phone) ? (
                <NameCard.Avatar size={40} user={user} />
              ) : null}

              <FlexContent>
                <CustomerName>
                  {isExistingCustomer && customer.name}
                </CustomerName>
                <SmallText>
                  to {brandName} via {integration && integration.kind}
                </SmallText>
              </FlexContent>
            </MainInfo>
            <MessageContent>{strip(content)}</MessageContent>
            <Label lblStyle="success">deal</Label>
          </FlexContent>
        </RowContent>
        <SmallText>
          {moment(createdAt)
            .subtract(2, 'minutes')
            .fromNow()}
        </SmallText>
      </RowItem>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
