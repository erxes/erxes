import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  ControlLabel,
  FormGroup
} from 'modules/common/components';
import { MESSENGER_KINDS, SENT_AS_CHOICES } from 'modules/engage/constants';
import Editor from './Editor';
import { EditorWrapper } from '../styles';
import { MessengerPreview } from '../containers';
import { FlexItem, Divider, FlexPad } from './step/style';

const propTypes = {
  brands: PropTypes.array,
  changeMessenger: PropTypes.func,
  users: PropTypes.array,
  hasKind: PropTypes.bool,
  defaultValue: PropTypes.object
};

class MessengerForm extends Component {
  constructor(props) {
    super(props);

    const message = props.defaultValue || {};

    this.state = {
      fromUser: message.fromUser || '',
      messenger: {
        brandId: message.messenger.brandId || '',
        kind: message.messenger.kind || '',
        sentAs: message.messenger.sentAs || ''
      }
    };
  }

  changeContent(key, value) {
    let messenger = {
      ...this.state.messenger
    };
    messenger[key] = value;
    this.setState({ messenger });
    this.props.changeMessenger('messenger', messenger);
  }

  changeUser(fromUser) {
    this.setState({ fromUser });
    this.props.changeMessenger('fromUser', fromUser);
  }

  renderKind(hasKind) {
    if (hasKind) {
      return (
        <FormGroup>
          <ControlLabel>Message type:</ControlLabel>
          <FormControl
            componentClass="select"
            onChange={e => this.changeContent('kind', e.target.value)}
            defaultValue={this.state.messenger.kind}
          >
            <option />{' '}
            {MESSENGER_KINDS.SELECT_OPTIONS.map(k => (
              <option key={k.value} value={k.value}>
                {k.text}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      );
    }
    return null;
  }
  render() {
    return (
      <FlexItem>
        <FlexPad overflow="auto" direction="column">
          <FormGroup>
            <ControlLabel>Message:</ControlLabel>
            <EditorWrapper>
              <Editor
                onChange={this.props.changeMessenger}
                defaultValue={this.props.defaultValue.message}
              />
            </EditorWrapper>
          </FormGroup>
          <FormGroup>
            <ControlLabel>From:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.changeUser(e.target.value)}
              defaultValue={this.state.fromUser}
            >
              <option />{' '}
              {this.props.users.map(u => (
                <option key={u._id} value={u._id}>
                  {u.fullName || u.username}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Brand:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.changeContent('brandId', e.target.value)}
              defaultValue={this.state.messenger.brandId}
            >
              <option />{' '}
              {this.props.brands.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          {this.renderKind(this.props.hasKind)}
          <FormGroup>
            <ControlLabel>Sent as:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.changeContent('sentAs', e.target.value)}
              defaultValue={this.state.messenger.sentAs}
            >
              <option />{' '}
              {SENT_AS_CHOICES.SELECT_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>
                  {s.text}
                </option>
              ))}
            </FormControl>
          </FormGroup>
        </FlexPad>
        <Divider />
        <FlexPad overflow="auto">
          <MessengerPreview
            sentAs={this.state.messenger.sentAs}
            content={this.props.defaultValue.message}
            fromUser={this.state.fromUser}
          />
        </FlexPad>
      </FlexItem>
    );
  }
}

MessengerForm.propTypes = propTypes;

export default MessengerForm;
