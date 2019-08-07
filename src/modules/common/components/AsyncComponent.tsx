import AnimatedLoader from 'modules/common/components/AnimatedLoader';
import Spinner from 'modules/common/components/Spinner';
import React from 'react';
import { IAnimatedLoader } from '../types';

export default function asyncComponent(
  importComponent: any,
  loaderStyle?: IAnimatedLoader
) {
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

      if (!Comp && loaderStyle) {
        return <AnimatedLoader loaderStyle={loaderStyle} />;
      }

      if (!Comp) {
        return <Spinner />;
      }

      return <Comp {...this.props} />;
    }
  }

  return AsyncComponent;
}
