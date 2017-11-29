import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import {
  Button,
  Icon,
  FormGroup,
  ControlLabel,
  FormControl,
  EmptyState
} from 'modules/common/components';
import { MarkdownWrapper } from '../../styles';
import SelectBrand from './SelectBrand';

class Common extends Component {
  static installCodeIncludeScript(type) {
    // TODO
    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${process.env.CDN_HOST}/${type}Widget.bundle.js";
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
      const brand = props.integration.brand;
      code = this.constructor.getInstallCode(brand.code);
    }

    this.state = {
      code,
      copied: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleBrandChange = this.handleBrandChange.bind(this);
  }

  updateInstallCodeValue(brandId) {
    if (brandId) {
      const brand = this.props.brands.find(brand => brand._id === brandId);

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
      brandId: document.getElementById('selectBrand').value
    });
  }

  render() {
    const integration = this.props.integration || {};

    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            id="integration-name"
            type="text"
            defaultValue={integration.name}
            required
          />
        </FormGroup>

        <SelectBrand
          brands={this.props.brands}
          defaultValue={integration.brandId}
          onChange={this.handleBrandChange}
        />

        {this.extraContent && this.extraContent()}

        <FormGroup>
          <ControlLabel>Install code</ControlLabel>
          <MarkdownWrapper>
            <ReactMarkdown source={this.state.code} />
            {this.state.code ? (
              <CopyToClipboard
                text={this.state.code}
                onCopy={() => this.setState({ copied: true })}
              >
                <Button size="small" btnStyle="primary">
                  <Icon icon="ios-copy-outline" />
                  {this.state.copied ? 'Copied' : 'Copy to clipboard'}
                </Button>
              </CopyToClipboard>
            ) : (
              <EmptyState icon="code" text="No copyable code" size="small" />
            )}
          </MarkdownWrapper>
        </FormGroup>

        <Modal.Footer>
          <Button btnStyle="success" type="submit">
            <Icon icon="checkmark" /> Save
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

Common.propTypes = {
  brands: PropTypes.array.isRequired, // eslint-disable-line
  integration: PropTypes.object, // eslint-disable-line
  save: PropTypes.func.isRequired
};

Common.contextTypes = {
  closeModal: PropTypes.func.isRequired
};

export default Common;
