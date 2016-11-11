import React, { PropTypes, Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Modal,
  Button,
} from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { add, edit } from '/imports/api/brands/methods';


const propTypes = {
  brand: PropTypes.object,
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

class BrandForm extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    const params = {
      doc: {
        name: document.getElementById('brand-name').value,
        description: document.getElementById('brand-description').value,
      },
    };

    let methodName = add;

    // if edit mode
    if (this.props.brand) {
      methodName = edit;
      params.id = this.props.brand._id;
    }

    methodName.call(params, (error) => {
      if (error) return Alert.error('Can\'t save brand', error.reason);

      Alert.success('Congrats', 'Brand is successfully saved.');
      return this.context.closeModal();
    });
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    const brand = this.props.brand || {};

    return (
      <form onSubmit={this.save}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            id="brand-name"
            type="text"
            defaultValue={brand.name}
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            id="brand-description"
            componentClass="textarea"
            defaultValue={brand.description}
            required
          />
        </FormGroup>

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button bsStyle="link" onClick={onClick}>Cancel</Button>
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

BrandForm.propTypes = propTypes;
BrandForm.contextTypes = contextTypes;

export default BrandForm;
