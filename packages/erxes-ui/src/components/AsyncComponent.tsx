import AnimatedLoader from './AnimatedLoader';
import { IAnimatedLoader } from '../types';
import React from 'react';
import Spinner from './Spinner';

function retry(fn, retriesLeft = 30, interval = 2000) {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch(error => {
        console.log(error);

        setTimeout(() => {
          if (retriesLeft === 1) {
            // reject('maximum retries exceeded');
            reject(error);
            return;
          }

          // Passing on "reject" is the important part
          retry(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
}

export default function asyncComponent(
  importComponent: any,
  loaderStyle?: IAnimatedLoader
): any {
  class AsyncComponent extends React.Component<any, { component: any }> {
    constructor(props) {
      super(props);

      this.state = {
        component: null
      };
    }

    async componentDidMount() {
      const { default: component }: any = await retry(() => importComponent());

      this.setState({ component });
    }

    render() {
      const Comp = this.state.component;

      if (Comp) {
        return <Comp {...this.props} />;
      }

      if (loaderStyle) {
        return <AnimatedLoader loaderStyle={loaderStyle} />;
      }

      return <Spinner />;
    }
  }

  return AsyncComponent;
}
