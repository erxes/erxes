import { Meteor } from 'meteor/meteor';
import React, { PropTypes, Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonToolbar,
  Modal,
} from 'react-bootstrap';
import { Brands } from '/imports/api/brands/brands';
import SelectBrand from './SelectBrand.jsx';


class InAppMessaging extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleBrandChange = this.handleBrandChange.bind(this);
  }

  getInstallCode(brandCode) {
    return `
      <script>
        window.erxesSettings = {
          email: <email>,
          created_at: <unix_timestamp>,
          brand_id: "${brandCode}"
        };
      </script>

      <script>
        (function() {
          var script = document.createElement('script');
          script.src = "${Meteor.settings.public.CDN_HOST}/widget.js";
          script.async = true;

          var entry = document.getElementsByTagName('script')[0];
          entry.parentNode.insertBefore(script, entry);
        })();
      </script>
    `;
  }

  updateInstallCodeValue(brandId) {
    const brand = Brands.findOne(brandId);
    const code = this.getInstallCode(brand.code);

    document.getElementById('install-code').value = code;
  }

  handleBrandChange(e) {
    this.updateInstallCodeValue(e.target.value);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save({
      name: document.getElementById('integration-name').value,
      brandId: document.getElementById('selectBrand').value,
    });
  }

  render() {
    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup controlId="integration-name">
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type="text"
            required
          />
        </FormGroup>

        <SelectBrand
          brands={this.props.brands}
          onChange={this.handleBrandChange}
        />

        <FormGroup controlId="install-code">
          <ControlLabel>Install code</ControlLabel>
          <FormControl
            componentClass="textarea"
            disabled
            rows={7}
          />
        </FormGroup>

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

InAppMessaging.propTypes = {
  brands: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
};

export default InAppMessaging;
