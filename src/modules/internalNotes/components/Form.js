import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl, Button, Icon } from 'modules/common/components';
import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const propTypes = {
  create: PropTypes.func.isRequired
};

const EditorActions = styled.div`
  padding: 0 20px 10px 20px;
  position: absolute;
  color: ${colors.colorCoreGray};
  bottom: 0;
  right: 0;

  i {
    margin: 0;
  }

  button {
    float: right;
    display: block;
    margin-right: 10px;
  }
`;

const EditorWrapper = styled.div`
  textarea {
    height: 100px;
    border-bottom: none;
    box-sizing: border-box;
    padding-left: ${dimensions.coreSpacing}px;
  }
`;

class Form extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: '',
      Editing: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.onSend = this.onSend.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ content: e.target.value, Editing: true });
  }

  onSend() {
    this.props.create(this.state.content);
    this.cancelEditing();
  }

  cancelEditing() {
    this.setState({ content: '', Editing: false });
  }

  renderFooter() {
    if (!this.state.Editing) return null;
    return (
      <EditorActions>
        <Button onClick={this.onSend} btnStyle="success" size="small">
          <Icon icon="android-send" /> Save note
        </Button>
        <Button onClick={this.cancelEditing} btnStyle="simple" size="small">
          <Icon icon="close" /> Discard
        </Button>
      </EditorActions>
    );
  }

  render() {
    return (
      <EditorWrapper>
        <form onKeyDown={this.handleKeyDown} onChange={this.handleChange}>
          <FormControl
            componentClass="textarea"
            placeholder="Start typing to leave a note ..."
            value={this.state.content}
          />
          {this.renderFooter()}
        </form>
      </EditorWrapper>
    );
  }
}

Form.propTypes = propTypes;

export default Form;
