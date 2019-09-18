import React from 'react';

type Props = {
  growthHacks: any[];
  growthHacksPriorityMatrix: any[];
};

class Left extends React.Component<Props> {
  render() {
    const growthHacks = this.props.growthHacks.map(growthHack => (
      <span key={growthHack._id}>
        impact: {growthHack.impact} ease: {growthHack.ease} <br />
      </span>
    ));

    const growthHacksPriorityMatrix = this.props.growthHacksPriorityMatrix.map(
      growthHack => (
        <span key={growthHack._id}>
          impact: {growthHack.impact} ease: {growthHack.ease} <br />
        </span>
      )
    );

    return (
      <div>
        <b>growthHacksPriorityMatrix:</b>
        <br /> {growthHacksPriorityMatrix}
        <br />
        <b>growthHacks:</b>
        <br /> {growthHacks}
      </div>
    );
  }
}

export default Left;
