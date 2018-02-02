import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import {
  FormControl,
  ControlLabel,
  FormGroup
} from 'modules/common/components';
import { MESSENGER_KINDS, SENT_AS_CHOICES } from 'modules/engage/constants';
import Editor from '../Editor';
import { EditorWrapper } from '../../styles';
import { MessengerPreview } from '../../containers';

const Content = styled.div`
  display: flex;
  height: 100%;
  margin: 20px;
`;

const FlexItem = styled.div`
  flex: 1;
  overflow: auto;
`;

const Divider = styled.div`
  width: 1px;
  background: ${colors.borderPrimary};
  min-height: 100%;
  margin: 0 10px;
`;

const ContentCenter = styled.div`
  flex: 1;
  overflow: auto;
`;

const propTypes = {
  brands: PropTypes.array,
  changeMessenger: PropTypes.func,
  changeMessage: PropTypes.func,
  message: PropTypes.string,
  changeUser: PropTypes.func,
  users: PropTypes.array,
  hasKind: PropTypes.bool,
  messenger: PropTypes.object,
  fromUser: PropTypes.string
};

class MessengerForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fromUser: this.props.fromUser || '',
      messenger: {
        brandId: this.props.messenger.brandId || '',
        kind: '',
        sentAs: this.props.messenger.sentAs || ''
      }
    };
    console.log(this.state.fromUser);
  }

  changeContent(key, value) {
    let messenger = { ...this.state.messenger };
    messenger[key] = value;
    this.setState({ messenger });
    this.props.changeMessenger(this.state.messenger);
  }

  changeUser(fromUser) {
    this.setState({ fromUser });
    this.props.changeUser(fromUser);
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
      <Content>
        <FlexItem>
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
          <FormGroup>
            <ControlLabel>Message:</ControlLabel>
            <EditorWrapper>
              <Editor
                onChange={this.props.changeMessage}
                defaultValue={this.props.message}
              />
            </EditorWrapper>
          </FormGroup>
        </FlexItem>
        <Divider />
        <ContentCenter>
          <MessengerPreview
            sentAs={this.state.messenger.sentAs}
            content={this.props.message}
            fromUser={this.state.fromUser}
          />
        </ContentCenter>
      </Content>
    );
  }
}

MessengerForm.propTypes = propTypes;

export default MessengerForm;
