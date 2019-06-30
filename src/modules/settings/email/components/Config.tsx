import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { IBrand } from '../../brands/types';

type Props = {
  brand: IBrand;
  defaultTemplate: string;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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
  }

  handleTypeChange = e => {
    this.setState({ type: e.target.value });
  };

  handleTemplateChange = e => {
    this.setState({ template: e.target.value });
  };

  generateDoc = (values: { _id?: string; type: string; template: string }) => {
    const { brand } = this.props;
    const finalValues = values;

    if (brand) {
      finalValues._id = brand._id;
    }

    return {
      _id: finalValues._id,
      emailConfig: {
        type: this.state.type,
        template: this.state.template
      }
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { type, template } = this.state;
    const { renderButton, closeModal, defaultTemplate } = this.props;
    const { values, isSubmitted } = formProps;

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
      <>
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
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Cancel
          </Button>

          {renderButton({
            name: 'email appearance',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default Config;
