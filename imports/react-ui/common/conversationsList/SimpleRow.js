import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { FlowRouter } from 'meteor/kadira:flow-router';
import strip from 'strip';
import classNames from 'classnames';
import { NameCard, Tags } from '/imports/react-ui/common';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  channelId: PropTypes.string,
  isRead: PropTypes.bool,
  toggleBulk: PropTypes.func,
};

class SimpleRow extends Component {
  constructor(props) {
    super(props);

    this.goDetail = this.goDetail.bind(this);
    this.toggleBulk = this.toggleBulk.bind(this);
    this.renderCheckbox = this.renderCheckbox.bind(this);
  }

  toggleBulk(e) {
    const { toggleBulk, conversation } = this.props;
    toggleBulk(conversation, e.target.checked);
  }

  goDetail() {
    FlowRouter.go(
      'inbox/details',
      { id: this.props.conversation._id },
      FlowRouter.current().queryParams,
    );
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
    const { createdAt, content, tags } = conversation;
    const customer = conversation.customer || {};
    const integration = conversation.integration || {};
    const brand = integration.brand || {};
    const brandName = brand.name;
    const rowClasses = classNames('simple-row', { unread: !isRead }, 'baseline-row');
    const isExistingCustomer = customer && customer._id;

    return (
      <li className={rowClasses}>
        {this.renderCheckbox()}
        <div className="body">
          <div className="items-horizontal">
            <div className="column">
              {(isExistingCustomer && customer.name) ||
                (isExistingCustomer && customer.email) ||
                (isExistingCustomer && customer.phone)
                ? <NameCard.Avatar size={40} customer={customer} />
                : null}
            </div>

            <header>
              <span className="customer-name">
                {isExistingCustomer && customer.name}
              </span>
              <div className="customer-email">
                {(isExistingCustomer && customer.email) || (isExistingCustomer && customer.phone)}
              </div>
            </header>
          </div>
          <div className="content" onClick={this.goDetail}>
            <span className="brandname hidden-tb">
              to {brandName}
              <time>
                {moment(createdAt).format('YYYY-MM-DD, HH:mm:ss')}
              </time>
              - {' '}
            </span>
            {strip(content)}
          </div>
          <Tags tags={tags} size="small" />
        </div>
      </li>
    );
  }
}

SimpleRow.propTypes = propTypes;

export default SimpleRow;
