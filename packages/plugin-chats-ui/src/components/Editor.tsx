import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import { getMentionedUserIds } from '@erxes/ui/src/components/EditorCK';
import React, { useState, useEffect, useRef } from 'react';
import FormControl from '@erxes/ui/src/components/form/Control';
import Tip from '@erxes/ui/src/components/Tip';
import Alert from '@erxes/ui/src/utils/Alert';
import {
  uploadHandler,
  __,
  readFile,
  uploadDeleteHandler
} from '@erxes/ui/src/utils';
import Icon from '@erxes/ui/src/components/Icon';
import {
  ChatEditor,
  Attachment,
  AttachmentIndicator,
  AttachmentThumb,
  FileName,
  PreviewImg
} from '../styles';
import VoiceRecorder from './voice/VoiceRecorder';
import { IAttachment } from '@erxes/ui/src/types';

type Props = {
  type?: string;
  reply?: any;
  setReply: (message: any) => void;
  sendMessage: (variables, callback: () => void) => void;
  mentions?: any;
};

const Editor = (props: Props) => {
  const { type, reply } = props;
  const [state, setState] = useState({ content: props.reply || '' });
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [loading, setLoading] = useState<object>({});
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

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

  const clearContent = () => {
    setState({ content: '' });
    setAttachments([]);
  };

  const handleSendMessage = () => {
    const { content } = state;
    const mentionedUserIds = getMentionedUserIds(content);

    props.sendMessage({ content, attachments, mentionedUserIds }, () => {
      clearContent();
    });
    props.setReply(null);
  };

  const handleDeleteFile = (url: string) => {
    const urlArray = url.split('/');

    const fileName =
      urlArray.length === 1 ? url : urlArray[urlArray.length - 1];

    let _loading = loading;
    _loading[url] = true;

    setLoading(_loading);

    uploadDeleteHandler({
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
    setUploadLoading(true);
    uploadHandler({
      files,
      maxHeight: 725,
      maxWidth: 725,
      beforeUpload: () => {
        return;
      },

      afterUpload: ({ status, response, fileInfo }) => {
        if (status !== 'ok') {
          Alert.error(response.statusText);
          return setUploadLoading(false);
        }
        Alert.success('Success');
        setAttachments([
          ...attachments,
          Object.assign({ url: response }, fileInfo)
        ]);
        setUploadLoading(false);
      }
    });
  };

  const handleKeyDown = (event: any) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      handleSendMessage();
      clearContent();
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
              {loading[attachment.url] || uploadLoading ? (
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
    if (uploadLoading && attachments.length === 0) {
      return (
        <AttachmentIndicator>
          <Attachment>
            Uploading...
            {<SmallLoader />}
          </Attachment>
        </AttachmentIndicator>
      );
    }

    return null;
  };

  const onEditorChange = e => {
    e.preventDefault();

    setState({
      content: e.target.value
    });
  };

  return (
    <>
      {renderIndicator()}
      <ChatEditor>
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
        <FormControl
          autoFocus={true}
          autoComplete="false"
          round={true}
          id="chat-widget-form-control"
          placeholder="Aa"
          maxHeight={140}
          onChange={(event: any) => onEditorChange(event)}
          value={state.content}
          onKeyDown={handleKeyDown}
          componentClass={type !== 'widget' && 'textarea'}
        />
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
