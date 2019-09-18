import React from 'react';

type Props = {
  growthHacks: any[];
};

class Left extends React.Component<Props> {
  render() {
    // tslint:disable-next-line: no-console
    console.log('this.props.growthHacks: ', this.props.growthHacks);
    return this.props.growthHacks.map(growthHack => (
      <span key={growthHack._id}>
        impact: {growthHack.impact} ease: {growthHack.ease}
      </span>
    ));
  }
}

export default Left;
