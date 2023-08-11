import Button from '@erxes/ui/src/components/Button';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import { getMentionedUserIds } from '@erxes/ui/src/components/EditorCK';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
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
  Attachment,
  AttachmentIndicator,
  AttachmentThumb,
  EditorActions,
  EditorWrapper,
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
  const [state, setState] = useState({ content: props.reply || '' });
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [loading, setLoading] = useState<object>({});
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (props.type === 'widget') {
      const element = document.getElementById('chat-widget-form-control');

      if (element) {
        element.focus();
      }
    } else if (editorRef && editorRef.current) {
      editorRef.current.focus();
    }
  }, [props.reply]);

  const clearContent = () => {
    setState({ content: '' });
    setAttachments([]);
    const editorName = `chat editor`;

    localStorage.removeItem(editorName);
  };

  const onSend = () => {
    const { content } = state;
    const mentionedUserIds = getMentionedUserIds(content);

    props.sendMessage({ content, attachments, mentionedUserIds }, () => {
      clearContent();
    });
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

  const renderFooter = () => {
    return (
      <>
        {renderIndicator()}

        <EditorActions>
          <Tip text={__('Audio')}>
            <label>
              <Icon icon="audio" />
              <input type="file" multiple={true} />
            </label>
          </Tip>
          <Tip text={__('Audio')}>
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
          {state.content && (
            <Button
              onClick={clearContent}
              btnStyle="warning"
              size="small"
              icon="eraser-1"
            >
              Discard
            </Button>
          )}

          <Button
            onClick={onSend}
            btnStyle="success"
            size="small"
            icon={'message'}
          >
            Send
          </Button>
        </EditorActions>
      </>
    );
  };

  const onEditorChange = e => {
    setState({
      content: e.editor.getData()
    });
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

  return (
    <>
      <EditorWrapper>
        <EditorCK
          removePlugins="elementspath"
          onCtrlEnter={onSend}
          content={state.content}
          onChange={onEditorChange}
          height={props.type === 'widget' ? 60 : 150}
          name={`Chat editor`}
          toolbar={
            props.type === 'widget'
              ? []
              : [
                  {
                    name: 'basicstyles',
                    items: [
                      'Bold',
                      'Italic',
                      'NumberedList',
                      'BulletedList',
                      'Link',
                      'Unlink',
                      '-',
                      'Image',
                      'EmojiPanel'
                    ]
                  }
                ]
          }
          mentionUsers={props.mentions}
        />

        {renderFooter()}
      </EditorWrapper>
    </>
  );
};

export default Editor;
