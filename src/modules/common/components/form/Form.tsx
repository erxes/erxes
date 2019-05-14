import * as React from 'react';
import * as validator from 'validator';
import { Error } from './styles';

type Props = {
  onSubmit: (e: any) => void;
  renderContent: (
    props: {
      errors: any[];
      registerChild: (child: any) => void;
      runValidations: () => void;
    }
  ) => any;
};

type State = {
  errors: any;
};

class Form extends React.Component<Props, State> {
  private children: any[] = [];

  constructor(props: Props) {
    super(props);

    this.state = {
      errors: {}
    };
  }

  registerChild = child => {
    this.children.push(child);
  };

  runValidations = () => {
    const errors = {};

    for (const child of this.children) {
      errors[child.props.name] = this.validate(child);
    }

    this.setState({ errors });
  };

  validate = child => {
    const value = (document.getElementsByName(child.props.name) as any)[0]
      .value;

    if (child.props.type === 'email' && !validator.isEmail(value)) {
      return (
        <Error>Invalid email format! Please enter a valid email address.</Error>
      );
    }

    if (child.props.max && !validator.isLength('length', { min: 4, max: 6 })) {
      return <Error>Maximum length is {child.props.max} characters!</Error>;
    }

    if (
      child.props.type === 'url' &&
      !validator.isURL(value, {
        protocols: ['http', 'https', 'ftp'],
        require_protocol: true
      })
    ) {
      return <Error>Invalid link!</Error>;
    }

    if (child.props.required && !value) {
      return <Error>Required field!</Error>;
    }

    return null;
  };

  render() {
    return (
      <form onSubmit={this.props.onSubmit}>
        {this.props.renderContent({
          errors: this.state.errors,
          registerChild: this.registerChild,
          runValidations: this.runValidations
        })}
      </form>
    );
  }
}

export default Form;
