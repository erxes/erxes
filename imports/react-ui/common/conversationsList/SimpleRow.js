import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { FlowRouter } from 'meteor/kadira:flow-router';
import strip from 'strip';
import classNames from 'classnames';
import { NameCard, Tags } from '/imports/react-ui/common';
import { Tags as TagsCollection } from '/imports/api/tags/tags';

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
    const { createdAt, content } = conversation;
    const customer = conversation.customer();
    const integration = conversation.integration();
    const brandName = integration.brand && integration.brand().name;
    const rowClasses = classNames('simple-row', { unread: !isRead }, 'vertical');
    // TODO: use embedded tags list of the conversation object
    const tags = TagsCollection.find({
      _id: { $in: conversation.tagIds || [] },
    }).fetch();

    console.log(customer);
    return (
      <li className={rowClasses}>
        <div className="items-horizontal">
          {this.renderCheckbox()}
          <div className="column">
            <NameCard.Avatar size={40} customer={customer} />
          </div>

          <div className="body">
            <header>
              <span className="customer-name">
                {customer && customer._id && customer.name}
              </span>
              <div className="customer-email">
                {customer && customer._id && customer.email}
              </div>
            </header>
          </div>
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
      </li>
    );
  }
}

SimpleRow.propTypes = propTypes;

export default SimpleRow;
