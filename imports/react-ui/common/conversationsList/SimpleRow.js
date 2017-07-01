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
    const rowClasses = classNames('simple-row', { unread: !isRead });
    // TODO: use embedded tags list of the conversation object
    const tags = TagsCollection.find({
      _id: { $in: conversation.tagIds || [] },
    }).fetch();

    return (
      <li className={rowClasses}>
        {this.renderCheckbox()}
        <div className="column">
          <NameCard.Avatar size={44} customer={customer} />
        </div>

        <div className="body">
          <header>
            <span className="customer-name">
              {customer && customer._id && customer.name}
            </span>

            <time>
              <span> opened </span>
              {moment(createdAt).fromNow()}
            </time>
          </header>
          <Tags tags={tags} size="small" />

          <div className="content" onClick={this.goDetail}>
            <span className="brandname hidden-tb">to {brandName} - </span>
            {strip(content)}
          </div>
        </div>
      </li>
    );
  }
}

SimpleRow.propTypes = propTypes;

export default SimpleRow;
