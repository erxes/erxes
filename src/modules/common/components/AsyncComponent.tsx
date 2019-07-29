import Spinner from 'modules/common/components/Spinner';
import React from 'react';

export default function asyncComponent(importComponent: any) {
  class AsyncComponent extends React.Component<any, { component: any }> {
    constructor(props) {
      super(props);

      this.state = {
        component: null
      };
    }

    async componentDidMount() {
      const { default: component } = await importComponent();

      this.setState({ component });
    }

    render() {
      const Comp = this.state.component;

      return Comp ? <Comp {...this.props} /> : <Spinner />;
    }
  }

  return AsyncComponent;
}
