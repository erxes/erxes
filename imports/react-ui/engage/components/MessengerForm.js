import React, { PropTypes, Component } from 'react';
import { FormControl } from 'react-bootstrap';
import { MESSENGER_KINDS, SENT_AS_CHOICES } from '/imports/api/engage/constants';
import Editor from './Editor';

const propTypes = {
  message: PropTypes.object.isRequired,
  onContentChange: PropTypes.func.isRequired,
};

class MessengerForm extends Component {
  constructor(props) {
    super(props);

    // binds
    this.onContentChange = this.onContentChange.bind(this);
  }

  onContentChange(content) {
    this.props.onContentChange(content);
  }

  render() {
    const message = this.props.message || {};
    const messenger = message.messenger || {};

    return (
      <div>
        <div className="header-row">
          <span>Message type:</span>
          <FormControl id="messengerKind" componentClass="select" defaultValue={messenger.kind}>
            <option />
            {MESSENGER_KINDS.SELECT_OPTIONS.map(k =>
              <option key={k.value} value={k.value}>
                {k.text}
              </option>,
            )}
          </FormControl>

          <span>Sent as:</span>
          <FormControl id="messengerSentAs" componentClass="select" defaultValue={messenger.sentAs}>
            <option />
            {SENT_AS_CHOICES.SELECT_OPTIONS.map(s =>
              <option key={s.value} value={s.value}>
                {s.text}
              </option>,
            )}
          </FormControl>

        </div>

        <Editor defaultValue={messenger.content} onChange={this.onContentChange} />,
      </div>
    );
  }
}

MessengerForm.propTypes = propTypes;

export default MessengerForm;
