import { IFormProps } from 'modules/common/types';
import React from 'react';
import validator from 'validator';
import { __ } from '../../utils';
import { Error } from './styles';

type Props = {
  renderContent: (props: IFormProps) => React.ReactNode;
  onSubmit?: (values: any) => any;
};

type State = {
  errors: any;
  values: any;
  isSubmitted: boolean;
};

class Form extends React.Component<Props, State> {
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

  getValue = child => {
    const { name } = child.props;

    const values = document.getElementsByName(name) as any;

    if (values.length > 1) {
      return values[values.length - 1].value;
    }

    return values[0].value;
  };

  onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();

    this.runValidations();
  };

  validate = child => {
    const { props } = child;
    const elements = document.getElementsByName(props.name) as any;

    const value =
      elements.length > 1
        ? elements[elements.length - 1].value
        : elements[0].value;

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

    if (value && props.type === 'number' && !validator.isInt(value)) {
      return (
        <Error>
          {__('Invalid number format! Please enter a valid number')}
        </Error>
      );
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
          runValidations: this.runValidations,
          isSubmitted: this.state.isSubmitted
        })}
      </form>
    );
  }
}

export default Form;
