import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { IBrand } from '../../brands/types';

type Props = {
  brand: IBrand;
  configEmail: (doc: {}, callback: () => void) => void;
  defaultTemplate: string;
  closeModal: () => void;
};

type State = {
  type: string;
  template: string;
};

class Config extends React.Component<Props, State> {
  constructor(props: Props) {
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
      return this.props.closeModal();
    });
  }

  handleTypeChange(e) {
    this.setState({ type: e.target.value });
  }

  handleTemplateChange(e) {
    this.setState({ template: e.target.value });
  }

  render() {
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
        <span>{__('Use html template here')}</span>
      </FormGroup>
    );

    return (
      <form id="configure-email-form" onSubmit={this.configureEmail}>
        <FormGroup>
          <ControlLabel>Choose your email template type</ControlLabel>
          <FormControl
            componentClass="select"
            placeholder={__('select')}
            onChange={this.handleTypeChange}
            value={type}
          >
            <option value="simple">{__('Simple')}</option>
            <option value="custom">{__('Custom')}</option>
          </FormControl>
        </FormGroup>

        {this.state.type === 'custom' ? templateControl : false}

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default Config;
