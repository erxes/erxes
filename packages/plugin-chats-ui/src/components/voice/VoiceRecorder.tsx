import Icon from '@erxes/ui/src/components/Icon';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IAttachment } from '@erxes/ui/src/types';
import { Alert, uploadHandler } from '@erxes/ui/src/utils';
import AudioRecorder from 'audio-recorder-polyfill';
import mpegEncoder from 'audio-recorder-polyfill/mpeg-encoder';
import React, { useRef, useState } from 'react';
import { RecordButton, VoiceRecordWrapper } from '../../styles';
import { __ } from '@erxes/ui/src/utils/core';
import Tip from '@erxes/ui/src/components/Tip';

type Props = {
  attachments: IAttachment[] | null;
  setAttachments: (attachments: IAttachment[]) => void;
};

const VoiceRecorder = (props: Props) => {
  const { attachments, setAttachments } = props;
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<any | null>(null);

  const [audioChunks] = useState<BlobPart[]>([]); // eslint-disable-line
  let longPressTimer;
  let recorder;

  AudioRecorder.encoder = mpegEncoder;
  AudioRecorder.prototype.mimeType = 'audio/mpeg';
  window.MediaRecorder = AudioRecorder;

  const startRecording = () => {
    setIsRecording(true);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        recorder = new MediaRecorder(stream);

        mediaRecorderRef.current = recorder;

        recorder.addEventListener('dataavailable', event => {
          audioChunks.push(event.data);
        });

        recorder.start(1000);

        recorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunks, {
            type: 'audio/wav; codecs=opus'
          });
          sendAudio(audioBlob);
        });

        // Stop the recording after 30 seconds
        setTimeout(() => {
          stopRecording(true);
        }, 30000);
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
        const errorMessage = error
          ?.toString()
          .replace('DOMException:', '')
          .replace('NotFoundError: ', '');

        setIsRecording(false);
        Alert.error(errorMessage);
      });
  };

  const stopRecording = (isForceStop: boolean) => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      const audioContext = new AudioContext();
      audioContext.close();
      const microphone = audioContext.createMediaStreamSource(
        mediaRecorderRef.current.stream
      );
      microphone.disconnect();

      setIsRecording(false);
      recorder = null;
    }
  };

  const convertBlobToFileList = (blob: Blob) => {
    const fileName = 'audio.wav';
    const file = new File([blob], fileName, { type: blob.type });
    const fileList = [file];

    return fileList;
  };

  const sendAudio = (audioBlob: Blob) => {
    const files: any = convertBlobToFileList(audioBlob);

    uploadHandler({
      files,
      beforeUpload: () => {
        setIsUploading(true);
        return <Spinner />;
      },
      afterUpload: ({ status, response, fileInfo }) => {
        if (status !== 'ok') {
          Alert.error(response.statusText);
          return setIsUploading(false);
        }
        Alert.success('Success');
        setAttachments([
          ...(attachments || []),
          Object.assign({ url: response }, fileInfo)
        ]);
        setIsUploading(false);
      }
    });
  };

  const handleMouseDown = () => {
    longPressTimer = setTimeout(startRecording, 750);
  };

  const handleMouseUp = () => {
    clearTimeout(longPressTimer);
    if (isRecording) {
      stopRecording(true);
    }
  };

  const handleMouseLeave = () => {
    clearTimeout(longPressTimer);
  };

  return (
    <VoiceRecordWrapper>
      {isUploading && <p>{__('preparing audio')}</p>}
      {isRecording && <p>{__('recording')}...</p>}
      <Tip
        text={
          isRecording ? __('release to send') : __('press and hold to record')
        }
      >
        <RecordButton
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          isRecording={isRecording}
        >
          <Icon icon="microphone-2" size={18} />
        </RecordButton>
      </Tip>
    </VoiceRecordWrapper>
  );
};

export default VoiceRecorder;
