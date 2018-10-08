import { EditorState, Modifier } from 'draft-js';
import { Editor as CommonEditor } from 'modules/common/components';
import { EMAIL_CONTENT_KEYS_FOR_SELECT } from 'modules/engage/constants';
import * as React from 'react';

const { ErxesEditor, toHTML, createStateFromHTML } = CommonEditor;

type Props = {
  editorState: EditorState;
  onEditorStateChange: (state: EditorState) => void;
};

const DynamicContent = ({ onEditorStateChange, editorState }: Props) => {
  const onChange = e => {
    const value = e.target.value;

    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    // insert new text to content state
    const contentState = Modifier.insertText(currentContent, selection, value);

    // update editor state
    onEditorStateChange(
      EditorState.push(editorState, contentState, 'insert-fragment')
    );
  };

  // render options
  const renderOptions = (options, groupValue, groupIndex) => {
    return options.map((option, optionIndex) => {
      return (
        <option
          value={`{{ ${groupValue}.${option.value} }}`}
          key={`optgroup-${groupIndex}-${optionIndex}`}
        >
          {option.text}
        </option>
      );
    });
  };

  // render opt groups
  const renderOptgroups = (group, options, index) => {
    return (
      <optgroup label={group.text} key={`optgroup-${index}`}>
        {renderOptions(options, group.value, index)}
      </optgroup>
    );
  };

  return (
    <select onChange={onChange}>
      <option>Attributes</option>

      {EMAIL_CONTENT_KEYS_FOR_SELECT.map(({ group, options }, index) => {
        return renderOptgroups(group, options, index);
      })}
    </select>
  );
};

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

    this.onChange = this.onChange.bind(this);
    this.getContent = this.getContent.bind(this);
  }

  getContent(editorState) {
    return toHTML(editorState);
  }

  onChange(editorState) {
    this.setState({ editorState });
    this.props.onChange('content', this.getContent(editorState));
  }

  render() {
    const props = {
      ...this.props,
      bordered: true,
      editorState: this.state.editorState,
      controls: [
        <DynamicContent
          key="dynamic-content-control"
          editorState={this.state.editorState}
          onEditorStateChange={this.onChange}
        />
      ],

      onChange: this.onChange
    };

    return <ErxesEditor {...props} />;
  }
}
