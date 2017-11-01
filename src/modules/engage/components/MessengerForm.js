import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'modules/common/components';
import Editor from './Editor';
import { MESSENGER_KINDS, SENT_AS_CHOICES } from 'modules/engage/constants';
import { MessengerPreview } from '../containers';

const propTypes = {
  message: PropTypes.object.isRequired,
  onContentChange: PropTypes.func.isRequired,
  showMessengerType: PropTypes.bool,
  fromUser: PropTypes.string.isRequired,
  brands: PropTypes.array
};

class MessengerForm extends Component {
  constructor(props) {
    super(props);

    const { message } = this.props;
    const messenger = message.messenger || {};

    this.state = {
      sentAs: messenger.sentAs || '',
      messengerContent: messenger.content || ''
    };

    // binds
    this.onContentChange = this.onContentChange.bind(this);
    this.onChangeSentAs = this.onChangeSentAs.bind(this);
  }

  onContentChange(content) {
    this.props.onContentChange(content);
    this.setState({ messengerContent: content });
  }

  onChangeSentAs(e) {
    this.setState({ sentAs: e.target.value });
  }

  renderMessageType(messenger) {
    if (this.props.showMessengerType) {
      return (
        <div className="header-row">
          <span>Message type:</span>
          <FormControl
            id="messengerKind"
            componentClass="select"
            defaultValue={messenger.kind}
          >
            <option />
            {MESSENGER_KINDS.SELECT_OPTIONS.map(k => (
              <option key={k.value} value={k.value}>
                {k.text}
              </option>
            ))}
          </FormControl>
        </div>
      );
    }
  }

  render() {
    const message = this.props.message || {};
    const messenger = message.messenger || {};
    const brands = this.props.brands;

    return (
      <div>
        <div className="form-header">
          <div className="header-row">
            <span>Brand:</span>
            <FormControl
              id="brandId"
              componentClass="select"
              defaultValue={messenger.brandId}
            >
              <option />
              {brands.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </FormControl>
          </div>

          {this.renderMessageType(messenger)}

          <div className="header-row">
            <span>Sent as:</span>
            <FormControl
              id="messengerSentAs"
              componentClass="select"
              onChange={this.onChangeSentAs}
              defaultValue={messenger.sentAs}
            >
              <option />
              {SENT_AS_CHOICES.SELECT_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>
                  {s.text}
                </option>
              ))}
            </FormControl>
          </div>
        </div>
        <div className="form-content">
          <div className="flex-content">
            <div className="messenger-content">
              <h2>Content</h2>
              <Editor
                defaultValue={messenger.content}
                onChange={this.onContentChange}
              />
            </div>
            <MessengerPreview
              sentAs={this.state.sentAs}
              content={this.state.messengerContent}
              fromUser={this.props.fromUser}
            />
          </div>
        </div>
      </div>
    );
  }
}

MessengerForm.propTypes = propTypes;

export default MessengerForm;
