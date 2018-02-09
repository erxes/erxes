import { EditorState, Modifier } from 'draft-js';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Editor as CommonEditor } from 'modules/common/components';
import { EMAIL_CONTENT_KEYS_FOR_SELECT } from 'modules/engage/constants';

const { ErxesEditor, toHTML, createStateFromHTML } = CommonEditor;

const DynamicContent = ({ onEditorStateChange, editorState }) => {
  const onChange = e => {
    const value = e.target.value;

    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    // insert new text to content state
    const contentState = Modifier.insertText(currentContent, selection, value);

    // update editor state
    onEditorStateChange(EditorState.push(editorState, contentState));
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

DynamicContent.propTypes = {
  editorState: PropTypes.object,
  onEditorStateChange: PropTypes.func
};

export default class Editor extends Component {
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

  onChange(editorState) {
    this.setState({ editorState });
    this.props.onChange('message', this.getContent(editorState));
  }

  getContent(editorState) {
    return toHTML(editorState);
  }

  render() {
    const props = {
      ...this.props,
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

Editor.propTypes = {
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
  onShifEnter: PropTypes.func
};
