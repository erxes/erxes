/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  ControlLabel,
  FormGroup,
  FormControl,
  Button
} from 'modules/common/components';
import { ContentBox } from '../styles';

class PropertyForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: '',
      validation: '',
      text: '',
      description: ''
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  addProperty(e) {
    return e;
  }

  onChange(e) {
    const value = e.target.value;
    const name = e.target.name;

    this.setState({ [name]: value });
  }

  render() {
    const { type, validation, text, description } = this.state;

    return (
      <ContentBox>
        <FormGroup>
          <ControlLabel htmlFor="type">Type:</ControlLabel>

          <FormControl
            name="type"
            componentClass="select"
            value={type}
            onChange={this.onChange}
          >
            <option />
            <option value="input">Input</option>
            <option value="textarea">Text area</option>
            <option value="select">Select</option>
            <option value="check">Checkbox</option>
            <option value="radio">Radio button</option>
            <option value="email">Email</option>
            <option value="firstName">First name</option>
            <option value="lastName">Last name</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="validation">Validation:</ControlLabel>

          <FormControl
            name="validation"
            componentClass="select"
            value={validation}
            onChange={this.onChange}
          >
            <option />
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="text">Text:</ControlLabel>
          <FormControl
            type="text"
            name="text"
            value={text}
            onChange={this.onChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="description">Description:</ControlLabel>
          <FormControl
            name="description"
            componentClass="textarea"
            value={description}
            onChange={this.onChange}
          />
        </FormGroup>

        <Modal.Footer>
          <Button
            btnStyle="simple"
            onClick={() => {
              this.context.closeModal();
            }}
            icon="close"
          >
            Close
          </Button>

          <Button
            btnStyle="success"
            type="submit"
            icon="checkmark"
            onClick={this.addGroup}
          >
            Save
          </Button>
        </Modal.Footer>
      </ContentBox>
    );
  }
}

PropertyForm.propTypes = {
  addField: PropTypes.func
};

export default PropertyForm;
