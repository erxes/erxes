import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Button, Icon } from 'modules/common/components';
import { CONVERSATION_STATUSES } from 'modules/inbox/constants';
import { PopoverButton } from 'modules/inbox/styles';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  changeStatus: PropTypes.func.isRequired,
  iconed: PropTypes.bool
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
    const { conversations, iconed } = this.props;
    const allNotClosed = _.reduce(
      conversations,
      (memo, conversation) =>
        conversation.status !== CONVERSATION_STATUSES.CLOSED,
      true
    );

    const attrs = {
      onClick: allNotClosed
        ? () => {
            this.changeStatus(CONVERSATION_STATUSES.CLOSED);
          }
        : () => {
            this.changeStatus(CONVERSATION_STATUSES.OPEN);
          }
    };

    const buttonText = allNotClosed ? 'Resolve' : 'Open';

    if (!iconed) {
      return <PopoverButton {...attrs}>{buttonText}</PopoverButton>;
    }

    const icon = allNotClosed ? 'checkmark' : 'refresh';

    const btnAttrs = {
      ...attrs,
      size: 'small',
      btnStyle: allNotClosed ? 'success' : 'warning'
    };

    return (
      <Button {...btnAttrs}>
        <Icon icon={icon} /> {buttonText}
      </Button>
    );
  }
}

Resolver.propTypes = propTypes;

export default Resolver;
