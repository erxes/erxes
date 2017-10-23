import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import { NameCard } from '../';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  channelId: PropTypes.string,
  isRead: PropTypes.bool,
  toggleBulk: PropTypes.func
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.toggleBulk = this.toggleBulk.bind(this);
    this.renderCheckbox = this.renderCheckbox.bind(this);
  }

  toggleBulk(e) {
    const { toggleBulk, conversation } = this.props;
    toggleBulk(conversation, e.target.checked);
  }

  renderCheckbox() {
    if (!this.props.toggleBulk) {
      return null;
    }

    return (
      <div className="column">
        <input type="checkbox" onChange={this.toggleBulk} />
      </div>
    );
  }

  render() {
    const { conversation, isRead } = this.props;
    const { createdAt, content } = conversation;
    const customer = conversation.customer || {};
    const integration = conversation.integration || {};
    const brand = integration.brand || {};
    const brandName = brand.name;
    const rowClasses = classNames(
      'simple-row',
      { unread: isRead },
      'baseline-row'
    );
    const isExistingCustomer = customer && customer._id;

    return (
      <li className={rowClasses}>
        {this.renderCheckbox()}
        <div className="body">
          <div className="items-horizontal">
            <div className="column">
              {(isExistingCustomer && customer.name) ||
              (isExistingCustomer && customer.email) ||
              (isExistingCustomer && customer.phone) ? (
                <NameCard.Avatar size={40} customer={customer} />
              ) : null}
            </div>

            <header>
              <span className="customer-name">
                {isExistingCustomer && customer.name}
              </span>
              <div className="customer-email">
                to {brandName} via {integration && integration.kind}
              </div>
            </header>
          </div>
          <div className="content" onClick={this.goDetail}>
            <span className="brandname hidden-tb">
              <time>{moment(createdAt).fromNow()}</time>
            </span>
            {content}
          </div>
        </div>
      </li>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
