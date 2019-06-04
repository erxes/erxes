import { IFormProps } from 'modules/common/types';
import * as React from 'react';
import * as validator from 'validator';
import { Error } from './styles';

type Props = {
  renderContent: (props: IFormProps) => React.ReactNode;
  onSubmit?: (values: any) => any;
};

type State = {
  errors: any;
  values: any;
};

class Form extends React.Component<Props, State> {
  private children: any[] = [];

  constructor(props: Props) {
    super(props);

    this.state = {
      errors: {},
      values: {}
    };
  }

  registerChild = child => {
    this.children.push(child);
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

      if (!hasErrors && this.props.onSubmit) {
        this.props.onSubmit(this.state.values);
      }
    });
  };

  getValue = child => {
    return (document.getElementsByName(child.props.name) as any)[0].value;
  };

  onSubmit = e => {
    e.preventDefault();

    this.runValidations();
  };

  validate = child => {
    const { props } = child;

    const value = (document.getElementsByName(props.name) as any)[0].value;

    if (props.required && !value) {
      return <Error>Required field!</Error>;
    }

    if (props.type === 'email' && !validator.isEmail(value)) {
      return (
        <Error>Invalid email format! Please enter a valid email address.</Error>
      );
    }

    if (
      props.max &&
      !validator.isLength('description', { min: 0, max: props.max })
    ) {
      return <Error>Maximum length is {props.max} characters!</Error>;
    }

    if (
      value &&
      props.type === 'url' &&
      !validator.isURL(value, {
        protocols: ['http', 'https', 'ftp'],
        require_protocol: true
      })
    ) {
      return <Error>Invalid link!</Error>;
    }

    if (value && props.type === 'number' && !validator.isInt(value)) {
      return <Error>Invalid number format! Please enter a valid number.</Error>;
    }

    return null;
  };

  render() {
    return (
      <form onSubmit={this.onSubmit} noValidate={true}>
        {this.props.renderContent({
          errors: this.state.errors,
          values: this.state.values,
          registerChild: this.registerChild,
          runValidations: this.runValidations
        })}
      </form>
    );
  }
}

export default Form;
