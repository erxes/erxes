import * as React from 'react';

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

    if (!value) {
      return 'Required';
    }

    return true;
  };

  render() {
    return (
      <form>
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
