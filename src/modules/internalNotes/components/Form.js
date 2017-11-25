import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl, Button, Icon } from 'modules/common/components';
import { EditorActions, EditorWrapper } from '../styles';

const propTypes = {
  create: PropTypes.func.isRequired
};

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
        <hr width="95%" />
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
