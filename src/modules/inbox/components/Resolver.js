import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Button } from 'modules/common/components';
import { CONVERSATION_STATUSES } from 'modules/inbox/constants';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  changeStatus: PropTypes.func.isRequired
};

class Resolver extends Component {
  constructor(props) {
    super(props);

    this.changeStatus = this.changeStatus.bind(this);
  }

  changeStatus(status) {
    const { conversations, changeStatus } = this.props;

    // call change status method
    changeStatus(
      conversations.map(c => {
        return c._id;
      }),
      status
    );
  }

  render() {
    const allNotClosed = _.reduce(
      this.props.conversations,
      (memo, conversation) =>
        conversation.status !== CONVERSATION_STATUSES.CLOSED,
      true
    );

    const buttonText = allNotClosed ? 'Resolve' : 'Open';
    const icon = allNotClosed ? 'checked' : 'refresh';

    const btnAttrs = {
      size: 'small',
      btnStyle: allNotClosed ? 'success' : 'warning',
      onClick: allNotClosed
        ? () => {
            this.changeStatus(CONVERSATION_STATUSES.CLOSED);
          }
        : () => {
            this.changeStatus(CONVERSATION_STATUSES.OPEN);
          }
    };

    return (
      <Button {...btnAttrs} icon={icon}>
        {buttonText}
      </Button>
    );
  }
}

Resolver.propTypes = propTypes;

export default Resolver;
