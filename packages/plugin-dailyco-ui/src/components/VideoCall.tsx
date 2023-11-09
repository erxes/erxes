import DailyIframe from '@daily-co/daily-js';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { SimpleButton } from '@erxes/ui/src/styles/main';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { mutations } from '../graphql';
import { __ } from '@erxes/ui/src/utils/core';
import { Alert } from '@erxes/ui/src/utils';

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

const VideoCall = props => {
  console.log('props', props);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [recordingId, setRecordingId] = useState('');
  let callFrame;
  const { url, conversationId } = props.queryParams;

  useEffect(() => {
    const owner = { url };
    const parentEl =
      document.getElementById('call-frame-container') ||
      document.getElementsByTagName('body')[0];

    callFrame = DailyIframe.createFrame(parentEl, {});

    callFrame
      .on('error', e => {
        setErrorMessage(e.errorMsg);
      })
      .on('recording-started', data => {
        setRecordingId(data.recordingId);
      })
      .on('recording-upload-completed', data => {
        if (data.action === 'recording-upload-completed') {
          client
            .mutate({
              mutation: gql(mutations.saveRecord),
              variables: {
                contentType: 'inbox:conversations',
                contentTypeId: conversationId,
                recordingId
              }
            })
            .catch(error => {
              Alert.error(error.message);
            });
        }
      });

    callFrame.join(owner);

    return () => {
      // Clean up code if needed
    };
  }, [props.queryParams]);

  const onDelete = () => {
    const { name } = props.queryParams;

    setLoading(true);
    client
      .mutate({
        mutation: gql(mutations.deleteRoom),
        variables: { name }
      })
      .then(({ data: { dailyDeleteVideoChatRoom } }) => {
        if (dailyDeleteVideoChatRoom) {
          window.close();
          setLoading(false);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const renderControls = () => {
    return (
      <Control>
        <ControlBtn onClick={onDelete} disabled={loading}>
          {loading ? __('Please wait...') : __('End call')}
        </ControlBtn>
      </Control>
    );
  };

  if (!url) {
    return null;
  }

  return (
    <>
      {renderControls()}
      {errorMessage && <Error>{errorMessage}</Error>}
      <div
        id="call-frame-container"
        style={{ width: '100%', height: '100%' }}
      />
    </>
  );
};

export default VideoCall;
