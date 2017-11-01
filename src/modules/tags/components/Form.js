import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';

const propTypes = {
  tag: PropTypes.object,
  type: PropTypes.string.isRequired,
  save: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class Form extends Component {
  static generateRandomColorCode() {
    return `#${Math.random()
      .toString(16)
      .slice(2, 8)}`;
  }

  constructor(props, context) {
    super(props, context);

    const { tag } = props;

    this.state = {
      name: tag ? tag.name : '',
      colorCode: tag ? tag.colorCode : Form.generateRandomColorCode()
    };

    this.submit = this.submit.bind(this);
    this.handleName = this.handleName.bind(this);
    this.handleColorCode = this.handleColorCode.bind(this);
  }

  submit(e) {
    e.preventDefault();

    const { tag, type, save } = this.props;
    const { name, colorCode } = this.state;

    save({
      tag,
      doc: { name, type, colorCode },
      callback: () => this.context.closeModal()
    });
  }

  handleName(e) {
    this.setState({ name: e.target.value });
  }

  handleColorCode(e) {
    this.setState({ colorCode: e.target.value });
  }

  render() {
    const { name, colorCode } = this.state;

    return (
      <form onSubmit={this.submit}>
        <FormGroup controlId="name">
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type="text"
            value={name}
            onChange={this.handleName}
            required
          />
        </FormGroup>

        <FormGroup controlId="colorCode">
          <ControlLabel>Color code</ControlLabel>
          <FormControl
            type="color"
            value={colorCode}
            onChange={this.handleColorCode}
          />
        </FormGroup>

        <Button btnStyle="success" type="submit">
          Save
        </Button>
      </form>
    );
  }
}

Form.propTypes = propTypes;
Form.contextTypes = contextTypes;

export default Form;
