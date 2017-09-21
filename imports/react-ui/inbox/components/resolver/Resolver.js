import React, { PropTypes, Component } from 'react';
import _ from 'lodash';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  single: PropTypes.bool,
  resolveText: PropTypes.string,
  openText: PropTypes.string,
  bsStyle: PropTypes.string,
  changeStatus: PropTypes.func.isRequired,
  CONVERSATION_STATUSES: PropTypes.object.isRequired,
};

class Resolver extends Component {
  constructor(props) {
    super(props);

    this.resolve = this.resolve.bind(this);
    this.open = this.open.bind(this);
    this.changeStatus = this.changeStatus.bind(this);
  }

  resolve() {
    this.changeStatus(this.props.CONVERSATION_STATUSES.CLOSED);
  }

  open() {
    this.changeStatus(this.props.CONVERSATION_STATUSES.OPEN);
  }

  changeStatus(status) {
    const args = {
      conversationIds: _.map(this.props.conversations, '_id'),
      status,
    };

    this.props.changeStatus(args, error => {
      if (error) {
        Alert.error('Error', error.reason);
      }

      if (status === 'closed') {
        Alert.success('The conversation has been resolved! ');
      } else {
        Alert.info('The conversation has been reopened and restored to Inbox.');
      }
    });
  }

  render() {
    const { conversations, CONVERSATION_STATUSES, resolveText, openText, bsStyle } = this.props;
    const style = bsStyle || 'link';
    const allNotClosed = _.reduce(
      conversations,
      (memo, conversation) => conversation.status !== CONVERSATION_STATUSES.CLOSED,
      true,
    );

    return allNotClosed
      ? <Button className="action-btn" bsStyle={style} onClick={this.resolve}>
          <i className="ion-checkmark-circled" /> {resolveText ? resolveText : 'Resolve'}
        </Button>
      : <Button className="action-btn" bsStyle={style} onClick={this.open}>
          <i className="ion-refresh" /> {openText ? openText : 'Open'}
        </Button>;
  }
}

Resolver.propTypes = propTypes;

export default Resolver;
