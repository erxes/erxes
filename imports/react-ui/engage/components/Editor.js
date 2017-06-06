import { EditorState } from 'draft-js';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ErxesEditor, toHTML, createStateFromHTML } from '/imports/react-ui/common/Editor';

export default class Editor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: createStateFromHTML(EditorState.createEmpty(), props.defaultValue),
    };

    this.onChange = this.onChange.bind(this);
    this.getContent = this.getContent.bind(this);
  }

  onChange(editorState) {
    this.setState({ editorState });

    this.props.onChange(this.getContent(editorState));
  }

  getContent(editorState) {
    return toHTML(editorState);
  }

  render() {
    const props = {
      ...this.props,
      editorState: this.state.editorState,
      onChange: this.onChange,
    };

    return <ErxesEditor {...props} />;
  }
}

Editor.propTypes = {
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
  onShifEnter: PropTypes.func,
};
