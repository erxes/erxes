import { EditorState } from 'draft-js';
import { Editor as CommonEditor } from 'modules/common/components';
import * as React from 'react';

const { ErxesEditor, toHTML, createStateFromHTML } = CommonEditor;

type EditorProps = {
  onChange: (name: 'content', getContent: string) => void;
  defaultValue?: string;
  onShifEnter?: () => void;
};

type State = {
  editorState: EditorState;
};

export default class Editor extends React.Component<EditorProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      editorState: createStateFromHTML(
        EditorState.createEmpty(),
        props.defaultValue || ''
      )
    };
  }

  getContent = editorState => {
    return toHTML(editorState);
  };

  onChange = editorState => {
    this.setState({ editorState });
    this.props.onChange('content', this.getContent(editorState));
  };

  render() {
    const props = {
      ...this.props,
      bordered: true,
      editorState: this.state.editorState,
      onChange: this.onChange
    };

    return <ErxesEditor {...props} />;
  }
}
