import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  HelpBlock,
  Modal
} from 'react-bootstrap';

const propTypes = {
  brand: PropTypes.object.isRequired,
  configEmail: PropTypes.func.isRequired,
  defaultTemplate: PropTypes.string.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class Config extends Component {
  constructor(props) {
    super(props);

    const { type, template } = props.brand.emailConfig || {
      type: 'simple',
      template: ''
    };

    this.state = { type, template: template || props.defaultTemplate };

    this.configureEmail = this.configureEmail.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleTemplateChange = this.handleTemplateChange.bind(this);
  }

  configureEmail(e) {
    e.preventDefault();

    const { brand, configEmail } = this.props;
    const { type, template } = this.state;

    configEmail({ _id: brand._id, emailConfig: { type, template } }, () => {
      return this.context.closeModal();
    });
  }

  handleTypeChange(e) {
    this.setState({ type: e.target.value });
  }

  handleTemplateChange(e) {
    this.setState({ template: e.target.value });
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    const { type, template } = this.state;

    const templateControl = (
      <FormGroup>
        <ControlLabel>Template markup</ControlLabel>
        <FormControl
          componentClass="textarea"
          value={template}
          rows={20}
          onChange={this.handleTemplateChange}
        />
        <HelpBlock>Use html template here</HelpBlock>
      </FormGroup>
    );

    return (
      <div className="margined">
        <form id="configure-email-form" onSubmit={this.configureEmail}>
          <FormGroup>
            <ControlLabel>Choose your email template type</ControlLabel>
            <FormControl
              componentClass="select"
              placeholder="select"
              onChange={this.handleTypeChange}
              value={type}
            >
              <option value="simple">Simple</option>
              <option value="custom">Custom</option>
            </FormControl>
          </FormGroup>

          {this.state.type === 'custom' ? templateControl : false}

          <Modal.Footer>
            <ButtonToolbar className="pull-right">
              <Button bsStyle="link" onClick={onClick}>
                Cancel
              </Button>
              <Button type="submit" bsStyle="primary">
                Save
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </form>
      </div>
    );
  }
}

Config.propTypes = propTypes;
Config.contextTypes = contextTypes;

export default Config;
