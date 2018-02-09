import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  ControlLabel,
  FormGroup
} from 'modules/common/components';
import { MESSENGER_KINDS, SENT_AS_CHOICES } from 'modules/engage/constants';
import Editor from '../Editor';
import { EditorWrapper } from '../../styles';
import { MessengerPreview } from '../../containers';
import { FlexItem, Divider, FlexPad } from './Style';

const propTypes = {
  brands: PropTypes.array,
  changeMessenger: PropTypes.func,
  message: PropTypes.string,
  users: PropTypes.array,
  hasKind: PropTypes.bool,
  messenger: PropTypes.object,
  fromUser: PropTypes.string
};

class MessengerForm extends Component {
  constructor(props) {
    super(props);

    const messenger = props.messenger ? props.messenger : {};

    this.state = {
      fromUser: this.props.fromUser || '',
      message: this.props.message || '',
      messenger: {
        brandId: messenger.brandId || '',
        kind: '',
        sentAs: messenger.sentAs || ''
      }
    };
  }

  componentDidMount() {
    if (this.props.messenger) {
      let messenger = { ...this.state.messenger };
      messenger['brandId'] = this.props.messenger.brandId;
      messenger['sentAs'] = this.props.messenger.sentAs;
      this.setState({ messenger: messenger });
    }
  }

  changeContent(key, value) {
    let messenger = { ...this.state.messenger };
    messenger[key] = value;
    this.setState({ messenger });
    this.props.changeMessenger('messenger', this.state.messenger);
  }

  changeUser(fromUser) {
    this.setState({ fromUser });
    this.props.changeMessenger('fromUser', fromUser);
  }

  render() {
    let kind = '';
    if (this.props.hasKind) {
      kind = (
        <FormGroup>
          <ControlLabel>Message type:</ControlLabel>
          <FormControl
            componentClass="select"
            onChange={e => this.changeContent('kind', e.target.value)}
          >
            <option />
            {MESSENGER_KINDS.SELECT_OPTIONS.map(k => (
              <option key={k.value} value={k.value}>
                {k.text}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      );
    }

    return (
      <FlexItem>
        <FlexPad overflow="auto" direction="column">
          <FormGroup>
            <ControlLabel>Message:</ControlLabel>
            <EditorWrapper>
              <Editor
                onChange={this.props.changeMessenger}
                defaultValue={this.state.message}
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
              <option />
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
              <option />
              {this.props.brands.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          {kind}
          <FormGroup>
            <ControlLabel>Sent as:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.changeContent('sentAs', e.target.value)}
              defaultValue={this.state.messenger.sentAs}
            >
              <option />
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
            content={this.props.message}
            fromUser={this.state.fromUser}
          />
        </FlexPad>
      </FlexItem>
    );
  }
}

MessengerForm.propTypes = propTypes;

export default MessengerForm;
