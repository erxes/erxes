import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form as Formsy,
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import { generateRandomColorCode } from 'modules/common/utils';
import { ModalFooter } from 'modules/common/styles/main';

const propTypes = {
  tag: PropTypes.object,
  type: PropTypes.string.isRequired,
  save: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class Form extends Component {
  constructor(props, context) {
    super(props, context);

    const { tag } = props;

    this.state = {
      name: tag ? tag.name : '',
      colorCode: tag ? tag.colorCode : generateRandomColorCode()
    };

    this.submit = this.submit.bind(this);
  }

  submit(doc) {
    const { tag, type, save } = this.props;

    const name = doc.name || '';
    const colorCode = doc.colorCode || generateRandomColorCode();

    save({
      tag,
      doc: { name, type, colorCode },
      callback: () => this.context.closeModal()
    });
  }

  render() {
    const { name, colorCode } = this.state;

    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <Formsy onSubmit={this.submit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type="text"
            value={name}
            validations="isValue"
            validationError="Please enter a name"
            name="name"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Color code</ControlLabel>
          <FormControl
            type="color"
            value={colorCode}
            validations="isValue"
            validationError="Please select a color code"
            name="colorCode"
          />
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={onClick} icon="cancel-1">
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </Formsy>
    );
  }
}

Form.propTypes = propTypes;
Form.contextTypes = contextTypes;

export default Form;
