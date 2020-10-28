import { IFormProps } from 'modules/common/types';
import React from 'react';
import validator from 'validator';
import { __, generateRandomString, isValidUsername } from '../../utils';
import { Error } from './styles';

type Props = {
  renderContent: (props: IFormProps) => React.ReactNode;
  onSubmit?: (values: any) => any;
  autoComplete?: string;
};

type State = {
  errors: any;
  values: any;
  isSubmitted: boolean;
};

class Form extends React.Component<Props, State> {
  private formId: string = generateRandomString();
  private children: any[] = [];

  constructor(props: Props) {
    super(props);

    this.state = {
      errors: {},
      values: {},
      isSubmitted: false
    };
  }

  registerChild = child => {
    this.children.push(child);
  };

  resetSubmit = () => {
    this.setState({ isSubmitted: false });
  };

  runValidations = () => {
    const errors = {};
    const values = {};

    for (const child of this.children) {
      errors[child.props.name] = this.validate(child);
      values[child.props.name] = this.getValue(child);
    }

    this.setState({ errors, values }, () => {
      const hasErrors = Object.values(errors).some(error => error !== null);

      if (hasErrors) {
        return;
      }

      if (this.props.onSubmit) {
        return this.props.onSubmit(this.state.values);
      }

      this.setState({ isSubmitted: !this.state.isSubmitted });
    });
  };

  getSelector = (name: string) => {
    return document.querySelector(`#${this.formId} [name='${name}']`) as any;
  };

  getValue = child => {
    const element = this.getSelector(child.props.name);

    if (element) {
      return element.value;
    }

    return '';
  };

  onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();

    this.runValidations();
  };

  validate = child => {
    const { props } = child;
    const element = this.getSelector(props.name);
    const value = element ? element.value : '';

    if (props.required && !value) {
      return <Error>{__('Required field')}</Error>;
    }

    if (props.type === 'email' && !validator.isEmail(value)) {
      return (
        <Error>
          {__('Invalid email format! Please enter a valid email address')}
        </Error>
      );
    }

    if (
      props.max &&
      !validator.isLength('description', { min: 0, max: props.max })
    ) {
      return (
        <Error>
          {__('Maximum length is')} {props.max} {__('characters')}
        </Error>
      );
    }

    if (value && props.type === 'url' && !validator.isURL(value)) {
      return <Error>{__('Invalid link')}</Error>;
    }

    if (value && props.type === 'number' && !validator.isFloat(value)) {
      return (
        <Error>
          {__('Invalid number format! Please enter a valid number')}
        </Error>
      );
    }

    if (value && props.name === 'username' && !isValidUsername(value)) {
      return <Error>{__('Invalid Username')}</Error>;
    }

    return null;
  };

  render() {
    return (
      <form
        id={this.formId}
        onSubmit={this.onSubmit}
        noValidate={true}
        autoComplete={this.props.autoComplete}
      >
        {this.props.renderContent({
          errors: this.state.errors,
          values: this.state.values,
          registerChild: this.registerChild,
          runValidations: this.runValidations,
          isSubmitted: this.state.isSubmitted,
          resetSubmit: this.resetSubmit
        })}
      </form>
    );
  }
}

export default Form;
