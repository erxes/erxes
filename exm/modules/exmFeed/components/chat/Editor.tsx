import React, { useState, useEffect, useRef } from 'react';
// erxes
import Alert from '../../../utils/Alert';
import FormControl from '../../../../modules/common/form/Control';
import Tip from '../../../../modules/common/Tip';
import Icon from '../../../../modules/common/Icon';
import { SmallLoader } from '../../../../modules/common/ButtonMutate';
import { readFile, uploadHandler, deleteHandler } from '../../../utils';
// local
import {
  ChatEditor,
  Attachment,
  AttachmentIndicator,
  AttachmentThumb,
  FileName,
  PreviewImg
} from '../../styles';
import VoiceRecorder from './voice/VoiceRecorder';

type Props = {
  type?: string;
  reply?: any;
  setReply: (message: any) => void;
  sendMessage: (message: string, attachments: any[]) => void;
};

const Editor = (props: Props) => {
  const { type, reply } = props;
  const [loading, setLoading] = useState<object>({});
  const [attachments, setAttachments] = useState<any>([]);
  const [message, setMessage] = useState<string>('');
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (type === 'widget') {
      const element = document.getElementById('chat-widget-form-control');

      if (element) {
        element.focus();
      }
    } else if (editorRef && editorRef.current) {
      editorRef.current.focus();
    }
  }, [reply]);

  const handleSendMessage = () => {
    props.sendMessage(message, attachments);
    props.setReply(null);
    setMessage('');
    setAttachments([]);
  };

  const handleDeleteFile = (url: string) => {
    const urlArray = url.split('/');

    const fileName =
      urlArray.length === 1 ? url : urlArray[urlArray.length - 1];

    let _loading = loading;
    _loading[url] = true;

    setLoading(_loading);

    deleteHandler({
      fileName,
      afterUpload: ({ status }) => {
        if (status === 'ok') {
          const remainedAttachments = attachments.filter(a => a.url !== url);

          setAttachments(remainedAttachments);

          Alert.success('You successfully deleted a file');
        } else {
          Alert.error(status);
        }

        _loading = loading;
        delete _loading[url];

        setLoading(loading);
      }
    });
  };

  const handleFileInput = (event: React.FormEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;

    uploadHandler({
      files,
      beforeUpload: () => {
        return;
      },

      afterUpload: ({ response, fileInfo }) => {
        setAttachments([
          ...attachments,
          Object.assign({ url: response }, fileInfo)
        ]);
      }
    });
  };

  const handleKeyDown = (event: any) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      handleSendMessage();
    }
  };

  const renderIndicator = () => {
    if (attachments.length > 0) {
      return (
        <AttachmentIndicator>
          {attachments.map(attachment => (
            <Attachment key={attachment.name}>
              <AttachmentThumb>
                {attachment.type.startsWith('image') && (
                  <PreviewImg
                    style={{
                      backgroundImage: `url(${readFile(attachment.url)})`
                    }}
                  />
                )}
              </AttachmentThumb>
              <FileName>{attachment.name}</FileName>
              <div>
                ({Math.round(attachment.size / 1000)}
                kB)
              </div>
              {loading[attachment.url] ? (
                <SmallLoader />
              ) : (
                <Icon
                  icon="times"
                  onClick={() => handleDeleteFile(attachment.url)}
                />
              )}
            </Attachment>
          ))}
        </AttachmentIndicator>
      );
    }

    return null;
  };

  return (
    <>
      {renderIndicator()}
      <ChatEditor>
        <FormControl
          autoFocus={true}
          autoComplete="false"
          round={true}
          id="chat-widget-form-control"
          placeholder="Aa"
          onChange={(event: any) => setMessage(event.target.value)}
          value={message}
          onKeyDown={handleKeyDown}
        />
        <Tip text={'Audio'}>
          <label>
            <Icon icon="audio" />
            <input type="file" multiple={true} />
          </label>
        </Tip>
        <Tip text={'Audio'}>
          <VoiceRecorder
            attachments={attachments}
            setAttachments={setAttachments}
          />
        </Tip>
        <Tip placement="top" text={'Attach file'}>
          <label>
            <Icon icon="clip" size={18} />
            <input type="file" onChange={handleFileInput} multiple={true} />
          </label>
        </Tip>
        <Tip placement="top" text={'Send'}>
          <label onClick={handleSendMessage}>
            <Icon icon="send" size={18} />
          </label>
        </Tip>
      </ChatEditor>
    </>
  );
};

export default Editor;
