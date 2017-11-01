import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MESSAGE_KINDS } from 'modules/engage/constants';
import { AutoAndManualForm, VisitorForm } from '../containers';

const propTypes = {
  kind: PropTypes.string.isRequired
};

class MessageForm extends Component {
  render() {
    const { kind } = this.props;

    if (kind === MESSAGE_KINDS.VISITOR_AUTO) {
      return <VisitorForm {...this.props} />;
    }

    return <AutoAndManualForm {...this.props} />;
  }
}

MessageForm.propTypes = propTypes;

export default MessageForm;
