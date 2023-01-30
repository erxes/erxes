import React, { useState, useEffect, useRef } from 'react';
import { ContentState, EditorState, getDefaultKeyBinding } from 'draft-js';
// erxes
import Alert from '@erxes/ui/src/utils/Alert';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import { ErxesEditor, toHTML } from '@erxes/ui/src/components/editor/Editor';
import {
  readFile,
  uploadHandler,
  uploadDeleteHandler
} from '@erxes/ui/src/utils';
// local
import {
  ChatEditor,
  ChatEditorWidget,
  ChatEditorActions,
  Attachment,
  AttachmentIndicator,
  AttachmentThumb,
  FileName,
  PreviewImg
} from '../styles';

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
  const [editorState, setEditorState] = useState<any>(() =>
    EditorState.createEmpty()
  );
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
    if (type === 'widget') {
      props.sendMessage(message, attachments);
      props.setReply(null);
      setMessage('');
      setAttachments([]);
    } else {
      const contentState = editorState.getCurrentContent();

      if (
        contentState.hasText() &&
        contentState
          .getBlockMap()
          .first()
          .getText() !== ''
      ) {
        props.sendMessage(toHTML(editorState), attachments);
        props.setReply(null);
        setAttachments([]);

        const newState = EditorState.push(
          editorState,
          ContentState.createFromText(''),
          'insert-characters'
        );

        setEditorState(EditorState.moveFocusToEnd(newState));
      }
    }
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

  const handleKeybind = (event: any) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      handleSendMessage();
      return null;
    }

    return getDefaultKeyBinding(event);
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

  if (type === 'widget') {
    return (
      <>
        {renderIndicator()}
        <ChatEditorWidget>
          <FormControl
            autoFocus
            autoComplete="false"
            round
            id="chat-widget-form-control"
            placeholder="Aa"
            onChange={(event: any) => setMessage(event.target.value)}
            value={message}
            onKeyDown={handleKeyDown}
          />
          <Tip placement="top" text={'Attach file'}>
            <label>
              <Icon icon="paperclip" size={18} />
              <input type="file" onChange={handleFileInput} multiple={true} />
            </label>
          </Tip>
          <Tip placement="top" text={'Send'}>
            <Button btnStyle="default" onClick={handleSendMessage}>
              <Icon icon="send" />
            </Button>
          </Tip>
        </ChatEditorWidget>
      </>
    );
  } else {
    return (
      <>
        {renderIndicator()}
        <ChatEditor>
          <ErxesEditor
            ref={editorRef}
            editorState={editorState}
            onChange={setEditorState}
            integrationKind={''}
            keyBindingFn={handleKeybind}
          />
          <ChatEditorActions>
            <Tip text={'Attach file'}>
              <label>
                <Icon icon="paperclip" />
                <input type="file" onChange={handleFileInput} multiple={true} />
              </label>
            </Tip>
            <Button onClick={handleSendMessage} style={{ float: 'right' }}>
              Send
            </Button>
          </ChatEditorActions>
        </ChatEditor>
      </>
    );
  }
};

export default Editor;
