import DailyIframe from '@daily-co/daily-js';
import client from 'apolloClient';
import gql from 'graphql-tag';
import { SimpleButton } from 'modules/common/styles/main';
import { Alert, __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { mutations } from '../graphql';

const Control = styledTS<{ disabled?: boolean }>(styled(SimpleButton))`
  width: auto;
  height: auto;
  position: absolute;
  right: 3px;
  padding: 0 10px;
  font-size: 13px;
  background: #fafafa;
  top: 3px;
  pointer-events: ${props => props.disabled && 'none'};
  opacity: ${props => props.disabled && '0.9'};
`;

const Error = styled.div`
  position: absolute;
  height: 30px;
  width: 100%;
  color: #721c24;
  background-color: #f8d7da;
  line-height: 28px;
  text-align: center;
  border: 1px solid #f5c6cb;
`;

type Props = {
  queryParams: any;
};

class VideoCall extends React.Component<
  Props,
  { loading: boolean; errorMessage: string }
> {
  private callFrame;

  constructor(props) {
    super(props);

    this.state = { errorMessage: '', loading: false };
  }

  componentDidMount() {
    const { url } = this.props.queryParams;

    const owner = { url };

    this.callFrame = DailyIframe.createFrame(
      document.getElementById('call-frame-container'),
      {}
    );

    this.callFrame.on('error', e => {
      this.setState({ errorMessage: e.errorMsg });
    });

    this.callFrame.join(owner);
  }

  onDelete = () => {
    const { name } = this.props.queryParams;

    this.setState({ loading: true });
    client
      .mutate({
        mutation: gql(mutations.deleteVideoChatRoom),
        variables: { name }
      })
      .then(({ data: { conversationDeleteVideoChatRoom } }) => {
        if (conversationDeleteVideoChatRoom) {
          window.close();
          this.setState({ loading: false });
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  renderControls() {
    return (
      <Control onClick={this.onDelete} disabled={this.state.loading}>
        {this.state.loading ? __('Please wait...') : __('End call')}
      </Control>
    );
  }

  render() {
    const { url } = this.props.queryParams;

    if (!url) {
      return;
    }

    return (
      <>
        {this.renderControls()}
        {this.state.errorMessage && <Error>{this.state.errorMessage}</Error>}
        <div
          id="call-frame-container"
          style={{ width: '100%', height: '100%' }}
        />
      </>
    );
  }
}

export default VideoCall;
