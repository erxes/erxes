import Button from '@erxes/ui/src/components/Button';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import { useGenerateJSON } from '@erxes/ui/src/components/richTextEditor/hooks/useExtensions';
import { getParsedMentions } from '@erxes/ui/src/components/richTextEditor/utils/getParsedMentions';
import RichTextEditor from '@erxes/ui/src/containers/RichTextEditor';
import React from 'react';
import styled from 'styled-components';

export const EditorActions = styled.div`
  width: 100%;
  background-color: #fff;
  padding: 15px;
  text-align: right;
  margin-top: auto;
`;

export const EditorWrapper = styled.div`
  position: relative;
  resize: vertical;
  overflow: hidden;
  min-height: 250px;
  display: flex;
  flex-direction: column;

  > .cke_chrome {
    border-bottom: 0;
    border-left: 0;
    border-right: 0;
  }

  .cke_bottom {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
  }

  .cke_toolgroup {
    border: 0;
    margin-left: 3px;
  }
`;

type Prop = {
  save: (variables, callback: () => void) => void;
  isActionLoading: boolean;
  content?: string;
  callback?: () => void;
  contentType: string;
  contentTypeId: string;
};

type State = {
  content: string;
};

class Form extends React.PureComponent<Prop, State> {
  constructor(props) {
    super(props);

    this.state = {
      content: props.content || '',
    };
  }

  clearContent = () => {
    this.setState({ content: '' });

    const { contentType, contentTypeId } = this.props;
    const editorName = `${contentType}_note_${contentTypeId}`;

    localStorage.removeItem(editorName);
  };

  onSend = () => {
    const { content } = this.state;
    const { callback } = this.props;

    const mentionedUserIds = getParsedMentions(useGenerateJSON(content));

    this.props.save({ content, mentionedUserIds }, () => {
      callback ? callback() : this.clearContent();
    });
  };

  renderFooter() {
    const { isActionLoading, content, callback } = this.props;

    if (!this.state.content) {
      return null;
    }

    return (
      <EditorActions>
        {content && (
          <Button
            icon="cancel-1"
            btnStyle="simple"
            size="small"
            onClick={callback}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={this.clearContent}
          btnStyle="warning"
          size="small"
          icon="eraser-1"
        >
          Discard
        </Button>

        <Button
          disabled={isActionLoading}
          onClick={this.onSend}
          btnStyle="success"
          size="small"
          icon={isActionLoading ? undefined : 'message'}
        >
          {isActionLoading && <SmallLoader />}
          Save
        </Button>
      </EditorActions>
    );
  }

  onEditorChange = (content: string) => {
    this.setState({ content });
  };

  render() {
    const { contentType, contentTypeId } = this.props;

    return (
      <EditorWrapper>
        <RichTextEditor
          showMentions={true}
          content={this.state.content}
          onChange={this.onEditorChange}
          height={"100%"}
          name={`${contentType}_note_${contentTypeId}`}
          toolbar={[
            'bold',
            'italic',
            'orderedList',
            'bulletList',
            'link',
            'unlink',
            '|',
            'image',
          ]}
          onCtrlEnter={this.onSend}
        />

        {this.renderFooter()}
      </EditorWrapper>
    );
  }
}

export default Form;
