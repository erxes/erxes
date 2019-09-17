import React from 'react';

type Props = {
  growthHacks: any[];
};

class Left extends React.Component<Props> {
  render() {
    const { growthHacks } = this.props;
    // tslint:disable-next-line: no-console
    console.log('growthHacks: ', growthHacks);

    return <div>Left</div>;
  }
}

export default Left;
