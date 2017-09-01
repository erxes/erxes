import React, { PropTypes, Component } from 'react';
import { FormControl } from 'react-bootstrap';
import { MESSENGER_KINDS, SENT_AS_CHOICES } from '/imports/api/engage/constants';
import { MessengerPreview } from '../containers';

const propTypes = {
  message: PropTypes.object.isRequired,
  onContentChange: PropTypes.func.isRequired,
  showMessengerType: PropTypes.bool,
  fromUser: PropTypes.string.isRequired,
  brands: PropTypes.array,
};

class MessengerForm extends Component {
  constructor(props) {
    super(props);

    this.state = { sentAs: props.message.messenger.sentAs || '' };

    // binds
    this.onContentChange = this.onContentChange.bind(this);
    this.onChangeSentAs = this.onChangeSentAs.bind(this);
  }

  onContentChange(content) {
    this.props.onContentChange(content);
  }

  onChangeSentAs(e) {
    this.setState({ sentAs: e.target.value });
  }

  renderMessageType(messenger) {
    if (this.props.showMessengerType) {
      return (
        <div className="header-row">
          <span>Message type:</span>
          <FormControl id="messengerKind" componentClass="select" defaultValue={messenger.kind}>
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
            <FormControl id="brandId" componentClass="select" defaultValue={messenger.brandId}>
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
          <MessengerPreview
            sentAs={this.state.sentAs}
            content={messenger.content}
            fromUser={this.props.fromUser}
            onContentChange={this.props.onContentChange}
          />
        </div>
      </div>
    );
  }
}

MessengerForm.propTypes = propTypes;

export default MessengerForm;
