import { Meteor } from 'meteor/meteor';
import React, { PropTypes, Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Modal,
  ButtonToolbar,
} from 'react-bootstrap';
import { Brands } from '/imports/api/brands/brands';
import { add, edit } from '/imports/api/integrations/methods';
import Alert from 'meteor/erxes-notifier';


class IntegrationForm extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleBrandChange = this.handleBrandChange.bind(this);
  }

  componentDidMount() {
    const integration = this.props.integration;

    if (integration) {
      this.updateInstallCodeValue(integration.brandId);
    }
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

    const params = {
      doc: {
        kind: document.getElementById('integration-kind').value,
        name: document.getElementById('integration-name').value,
        brandId: document.getElementById('selectBrand').value,
      },
    };

    let methodName = add;

    // if edit mode
    if (this.props.integration) {
      methodName = edit;
      params.id = this.props.integration._id;
    }

    methodName.call(params, () => {
      Alert.success('Congrats', 'Brand is successfully saved.');
      return this.context.closeModal();
    });
  }

  render() {
    const integration = this.props.integration || {};

    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form id="response-form" onSubmit={this.handleSubmit}>
        <FormGroup controlId="integration-name">
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type="text"
            defaultValue={integration.name}
            required
          />
        </FormGroup>

        <FormGroup controlId="integration-kind">
          <ControlLabel>Kind</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder="Select Kind"
            defaultValue={integration.kind}
          >
            <option value="in_app_messaging">In app messaging</option>
          </FormControl>
        </FormGroup>

        <FormGroup
          onChange={this.handleBrandChange}
          controlId="selectBrand"
        >

          <ControlLabel>Brand Name</ControlLabel>

          <FormControl
            componentClass="select"
            defaultValue={integration.brandId}
            placeholder="Select Brand"
          >

            {this.props.brands.map(brand =>
              <option key={brand._id} value={brand._id}>{brand.name}</option>
            )}
          </FormControl>
        </FormGroup>

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
            <Button bsStyle="link" onClick={onClick}>Cancel</Button>
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

IntegrationForm.propTypes = {
  brands: PropTypes.array,
  integration: PropTypes.object,
};

IntegrationForm.contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default IntegrationForm;
