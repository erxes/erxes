import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'react-bootstrap';

const propTypes = {
  create: PropTypes.func.isRequired
};

class Form extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleKeyDown(e) {
    if (e.keyCode === 13 && e.shiftKey === false) {
      this.props.create(this.state.content);
    }
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ content: e.target.value });
  }

  render() {
    return (
      <div className="customers-internal-notes-form">
        <form onKeyDown={this.handleKeyDown} onChange={this.handleChange}>
          <FormControl
            componentClass="textarea"
            placeholder="Start typing to leave a note ..."
          />
        </form>
      </div>
    );
  }
}

Form.propTypes = propTypes;

export default Form;
