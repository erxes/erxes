import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, uploadHandler } from '@erxes/ui/src/utils';
import React, { useRef, useState } from 'react';
import { IAttachment } from '@erxes/ui/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import { Button } from '../../styles';

type Props = {
  attachments: IAttachment[] | null;
  setAttachments: (attachments: IAttachment[]) => void;
};

const VoiceRecorder = (props: Props) => {
  const { attachments, setAttachments } = props;
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  let longPressTimer;

  const startRecording = () => {
    setIsRecording(true);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        const audioChunks: BlobPart[] = [];
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.addEventListener('dataavailable', event => {
          audioChunks.push(event.data);
        });

        mediaRecorderRef.current.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunks, {
            type: 'audio/mp3'
          });
          sendAudio(audioBlob);
        });

        mediaRecorderRef.current.start();

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
    if (mediaRecorderRef.current && isForceStop) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const convertBlobToFileList = (blob: Blob) => {
    const fileName = 'audio.mp3';
    const file = new File([blob], fileName, { type: blob.type });
    const fileList = [file];

    return fileList;
  };

  const sendAudio = (audioBlob: Blob) => {
    const files: any = convertBlobToFileList(audioBlob);

    uploadHandler({
      files: files,
      beforeUpload: () => {
        return <Spinner />;
      },
      afterUpload: ({ response, fileInfo }) => {
        setAttachments([
          ...(attachments || []),
          Object.assign({ url: response }, fileInfo)
        ]);
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
    <div>
      <Button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        isRecording={isRecording}
      >
        <Icon icon="microphone-2" size={18} />
      </Button>
    </div>
  );
};

export default VoiceRecorder;
