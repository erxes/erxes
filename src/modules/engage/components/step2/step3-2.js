import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import {
  FormControl,
  ControlLabel,
  FormGroup,
  Icon
} from 'modules/common/components';
import { MESSENGER_KINDS, SENT_AS_CHOICES } from 'modules/engage/constants';
import Editor from '../Editor';
import { EditorWrapper } from '../../styles';
import { MessengerPreview } from '../../containers';

const Content = styled.div`
  display: flex;
  height: 100%;
`;

const Flex100 = styled.div`
  flex: 1 100%;
`;

const Divider = styled.div`
  width: 1px;
  background: ${colors.borderPrimary};
  height: 100%;
  margin: 0 10px;
`;

const ContentCenter = styled.div`
  flex: 1 100%;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const propTypes = {
  brands: PropTypes.array
};

class Step3 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sentAs: '',
      content: '',
      fromUser: ''
    };
  }
  onContentChange() {
    console.log('sjdfsdaf');
  }
  render() {
    return (
      <Content>
        <Flex100>
          <FormGroup>
            <ControlLabel>Brand:</ControlLabel>
            <FormControl id="brandId" componentClass="select">
              <option />
              {this.props.brands.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Message type:</ControlLabel>
            <FormControl id="messengerKind" componentClass="select">
              <option />
              {MESSENGER_KINDS.SELECT_OPTIONS.map(k => (
                <option key={k.value} value={k.value}>
                  {k.text}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Sent as:</ControlLabel>
            <FormControl
              id="messengerSentAs"
              componentClass="select"
              onChange={this.onChangeSentAs}
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
              <Editor onChange={this.onContentChange} />
            </EditorWrapper>
          </FormGroup>
        </Flex100>
        <Divider />
        <ContentCenter>
          <MessengerPreview
            sentAs={this.state.sentAs}
            content={this.state.messengerContent}
            fromUser={this.props.fromUser}
          />
        </ContentCenter>
      </Content>
    );
  }
}

Step3.propTypes = propTypes;

export default Step3;
