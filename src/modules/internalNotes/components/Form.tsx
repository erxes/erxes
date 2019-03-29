import { ContentState, EditorState, getDefaultKeyBinding } from 'draft-js';
import { Button } from 'modules/common/components';
import {
  createStateFromHTML,
  ErxesEditor,
  toHTML
} from 'modules/common/components/editor/Editor';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';

export const EditorActions = styled.div`
  padding: 0 20px 10px 20px;
  position: absolute;
  color: ${colors.colorCoreGray};
  bottom: 0;
  right: 0;
`;

const EditorWrapper = styled.div`
  position: relative;

  .RichEditor-editor .public-DraftEditor-content {
    min-height: 130px;
    padding-bottom: 40px;
  }
`;

class Form extends React.PureComponent<
  { create: (content: string) => void },
  { editorState: EditorState }
> {
  constructor(props) {
    super(props);

    this.state = {
      editorState: createStateFromHTML(EditorState.createEmpty(), '')
    };
  }

  getContent = editorState => {
    return toHTML(editorState);
  };

  onChangeContent = editorState => {
    this.setState({ editorState });
  };

  hasText() {
    return this.state.editorState.getCurrentContent().hasText();
  }

  clearContent = () => {
    const state = this.state.editorState;

    const editorState = EditorState.push(
      state,
      ContentState.createFromText(''),
      'insert-characters'
    );

    this.setState({ editorState: EditorState.moveFocusToEnd(editorState) });
  };

  keyBindingFn = e => {
    // handle new line
    if (e.key === 'Enter' && e.shiftKey) {
      return getDefaultKeyBinding(e);
    }

    // handle enter  in editor
    if (e.key === 'Enter') {
      if (this.hasText()) {
        this.onSend();

        return null;
      }

      return null;
    }

    return getDefaultKeyBinding(e);
  };

  onSend = () => {
    this.props.create(this.getContent(this.state.editorState));

    this.clearContent();
  };

  renderFooter() {
    if (!this.hasText()) {
      return null;
    }

    return (
      <EditorActions>
        <Button
          onClick={this.clearContent}
          btnStyle="warning"
          size="small"
          icon="eraser-1"
        >
          Discard
        </Button>
        <Button
          onClick={this.onSend}
          btnStyle="success"
          size="small"
          icon="send"
        >
          Save
        </Button>
      </EditorActions>
    );
  }

  render() {
    const props = {
      editorState: this.state.editorState,
      onChange: this.onChangeContent,
      keyBindingFn: this.keyBindingFn,
      placeholder: __('Write your note here')
    };

    return (
      <EditorWrapper>
        <ErxesEditor {...props} />
        {this.renderFooter()}
      </EditorWrapper>
    );
  }
}

export default Form;
