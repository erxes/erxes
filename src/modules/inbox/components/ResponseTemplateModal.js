import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ModalTrigger,
  Button,
  FormControl,
  FormGroup,
  ControlLabel
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/styles';

const propTypes = {
  onSave: PropTypes.func.isRequired,
  brands: PropTypes.array,
  trigger: PropTypes.node,
  brandId: PropTypes.string.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class ResponseTemplateModal extends Component {
  constructor(props) {
    super(props);

    this.onSave = this.onSave.bind(this);
  }

  onSave() {
    const doc = {
      brandId: document.getElementById('template-brand-id').value,
      name: document.getElementById('template-name').value
    };

    this.props.onSave(doc.brandId, doc.name);
  }

  render() {
    const { __ } = this.context;
    const { brands, trigger, brandId } = this.props;

    return (
      <ModalTrigger title="Create response template" trigger={trigger}>
        <FormGroup>
          <ControlLabel>Brand</ControlLabel>

          <FormControl
            id="template-brand-id"
            componentClass="select"
            placeholder={__('Select Brand')}
            defaultValue={brandId}
          >
            {brands.map(brand => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl id="template-name" type="text" required />
        </FormGroup>

        <ModalFooter>
          <Button onClick={this.onSave} btnStyle="success" icon="checkmark">
            Save
          </Button>
        </ModalFooter>
      </ModalTrigger>
    );
  }
}

ResponseTemplateModal.propTypes = propTypes;
ResponseTemplateModal.contextTypes = contextTypes;

export default ResponseTemplateModal;
