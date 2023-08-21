// import DailyIframe from '@daily-co/daily-js';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { SimpleButton } from '@erxes/ui/src/styles/main';
import { __, Alert } from 'coreui/utils';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { mutations } from '../graphql';

const Control = styled('div')`
  position: absolute;
  right: 3px;
  top: 3px;
`;

const ControlBtn = styledTS<{ disabled?: boolean }>(styled(SimpleButton))`
  float: left;
  
  width: auto;
  height: auto;
  
  padding: 0 10px;
  margin: 0 20px;
  font-size: 13px;
  background: #fafafa;
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

type States = {
  loading: boolean;
  errorMessage?: string;
  recordingId?: string;
};

class VideoCall extends React.Component<Props, States> {
  private callFrame;

  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  componentDidMount() {
    const { url, conversationId } = this.props.queryParams;

    const owner = { url };

    const parentEl =
      document.getElementById('call-frame-container') ||
      document.getElementsByTagName('body')[0];

    // this.callFrame = DailyIframe.createFrame(parentEl, {});

    // this.callFrame
    //   .on('error', e => {
    //     this.setState({ errorMessage: e.errorMsg });
    //   })
    //   .on('recording-started', data => {
    //     this.setState({
    //       recordingId: data.recordingId
    //     });
    //   })
    //   .on('recording-upload-completed', data => {
    //     if (data.action === 'recording-upload-completed') {
    //       client
    //         .mutate({
    //           mutation: gql(mutations.saveVideoRecordingInfo),
    //           variables: {
    //             conversationId,
    //             recordingId: this.state.recordingId
    //           }
    //         })
    //         .catch(error => {
    //           Alert.error(error.message);
    //         });
    //     }
    //   });

    // this.callFrame.join(owner);
  }

  onDelete = () => {
    const { name } = this.props.queryParams;

    this.setState({ loading: true });
    client
      .mutate({
        mutation: gql(mutations.deleteVideoChatRoom),
        variables: { name }
      })
      .then(({ data: { integrationsDeleteVideoChatRoom } }) => {
        if (integrationsDeleteVideoChatRoom) {
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
      <Control>
        <ControlBtn onClick={this.onDelete} disabled={this.state.loading}>
          {this.state.loading ? __('Please wait...') : __('End call')}
        </ControlBtn>
      </Control>
    );
  }

  render() {
    const { url } = this.props.queryParams;

    if (!url) {
      return;
    }

    const { errorMessage } = this.state;

    return (
      <>
        {this.renderControls()}
        {errorMessage && <Error>{errorMessage}</Error>}
        <div
          id="call-frame-container"
          style={{ width: '100%', height: '100%' }}
        />
      </>
    );
  }
}

export default VideoCall;
