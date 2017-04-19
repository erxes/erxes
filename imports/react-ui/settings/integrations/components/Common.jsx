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
import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Brands } from '/imports/api/brands/brands';
import SelectBrand from './SelectBrand.jsx';

class Common extends Component {
  static installCodeIncludeScript(type) {
    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${Meteor.settings.public.CDN_HOST}/${type}Widget.bundle.js";
        script.async = true;

        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    `;
  }

  constructor(props, context) {
    super(props, context);

    let code = '';

    // showed install code automatically in edit mode
    if (props.integration) {
      const brand = Brands.findOne(props.integration.brandId);
      code = this.constructor.getInstallCode(brand.code);
    }

    this.state = {
      code,
      copied: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleBrandChange = this.handleBrandChange.bind(this);
  }

  updateInstallCodeValue(brandId) {
    if (brandId) {
      const brand = Brands.findOne(brandId);
      const code = this.constructor.getInstallCode(brand.code);

      this.setState({ code, copied: false });
    }
  }

  handleBrandChange(e) {
    this.updateInstallCodeValue(e.target.value);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.context.closeModal();

    this.props.save({
      name: document.getElementById('integration-name').value,
      brandId: document.getElementById('selectBrand').value,
    });
  }

  render() {
    const integration = this.props.integration || {};

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup controlId="integration-name">
          <ControlLabel>Name</ControlLabel>
          <FormControl type="text" defaultValue={integration.name} required />
        </FormGroup>

        <SelectBrand
          brands={this.props.brands}
          defaultValue={integration.brandId}
          onChange={this.handleBrandChange}
        />

        {this.extraContent && this.extraContent()}

        <FormGroup controlId="install-code">
          <ControlLabel>Install code</ControlLabel>
          <div className="markdown-wrapper">
            <ReactMarkdown source={this.state.code} />
            {this.state.code
              ? <CopyToClipboard
                  text={this.state.code}
                  onCopy={() => this.setState({ copied: true })}
                >
                  <Button bsSize="small" bsStyle="primary">
                    {this.state.copied ? 'Copied' : 'Copy to clipboard'}
                  </Button>
                </CopyToClipboard>
              : null}
          </div>
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

Common.propTypes = {
  brands: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  integration: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  save: PropTypes.func.isRequired,
};

Common.contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default Common;
