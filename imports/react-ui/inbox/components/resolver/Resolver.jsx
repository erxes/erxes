import React, { PropTypes, Component } from 'react';
import _ from 'lodash';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  single: PropTypes.bool,
  changeStatus: PropTypes.func.isRequired,
  afterSave: PropTypes.func.isRequired,
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

      this.props.afterSave();
    });
  }

  render() {
    const { conversations, CONVERSATION_STATUSES } = this.props;
    const allNotClosed = _.reduce(
      conversations,
      (memo, conversation) => conversation.status !== CONVERSATION_STATUSES.CLOSED,
      true,
    );

    return allNotClosed
      ? <Button bsStyle="link" onClick={this.resolve}>
          <i className="ion-checkmark-circled" /> Resolve
        </Button>
      : <Button bsStyle="link" onClick={this.open}>
          <i className="ion-refresh" /> Open
        </Button>;
  }
}

Resolver.propTypes = propTypes;

export default Resolver;
