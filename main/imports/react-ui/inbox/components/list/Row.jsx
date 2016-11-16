import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { NameCard, Tags } from '/imports/react-ui/common';
import { Starrer } from '../../containers';
import { Assignees } from '../../components';
import { Tags as TagsCollection } from '/imports/api/tags/tags';


const propTypes = {
  conversation: PropTypes.object.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  starred: PropTypes.bool.isRequired,
  channelId: PropTypes.string,
  isRead: PropTypes.bool,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.goDetail = this.goDetail.bind(this);
    this.toggleBulk = this.toggleBulk.bind(this);
  }

  toggleBulk(e) {
    const { toggleBulk, conversation } = this.props;
    toggleBulk(conversation, e.target.checked);
  }

  goDetail() {
    const { conversation, channelId } = this.props;

    FlowRouter.go('inbox/details', { id: conversation._id }, { channelId });
  }

  render() {
    const { conversation, starred, isRead } = this.props;
    const { createdAt, content, commentCount } = conversation;
    const customer = conversation.customer();
    const isReadClass = !isRead ? 'unread' : null;
    const integration = conversation.integration();

    // TODO: use embedded tags list of the conversation object
    const tags = TagsCollection.find({ _id: { $in: conversation.tagIds || [] } }).fetch();

    return (
      <li className={isReadClass}>
        <div className="column">
          <input type="checkbox" onChange={this.toggleBulk} />
        </div>

        <div className="column">
          <NameCard.Avatar size={50} customer={customer} />
        </div>

        <div className="body">
          <header>
            <span className="customer-name">{customer.name}</span>
            <span> opened about </span>
            <time>{moment(createdAt).fromNow()}</time>
            <Tags tags={tags} size="small" />
          </header>
          <div className="content" onClick={this.goDetail}>
            {content}
          </div>
          <footer>
            <div className="source">
              <i className="ion-chatbox"></i>
              <div className="name">
                To {integration.brand().name} via {integration.kind}
              </div>
            </div>

            <Assignees conversation={conversation} />

            <div className="info">
              <span><i className="ion-reply"></i> {commentCount}</span>
              <span><i className="ion-person"></i> {conversation.participatorCount()}</span>
              <span><i className="ion-paperclip"></i> 1</span>
            </div>
          </footer>
        </div>

        <div className="column togglers">
          <span>
            <Starrer conversation={conversation} starred={starred} />
          </span>
          <span>
            <i className="ion-eye"></i>
          </span>
        </div>
      </li>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
