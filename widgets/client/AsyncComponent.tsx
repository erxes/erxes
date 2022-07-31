import * as React from 'react';

function retry(fn: any, retriesLeft = 30, interval = 2000) {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error: any) => {
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
): any {
  class AsyncComponent extends React.Component<any, { component: any }> {
    constructor(props: any) {
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

      return <div/>;
    }
  }

  return AsyncComponent;
}
