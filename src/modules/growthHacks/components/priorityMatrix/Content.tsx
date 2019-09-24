import { ContentContainer } from 'modules/growthHacks/styles';
import React from 'react';
import Chart from './Chart';
import Left from './Left';

type Props = {
  growthHacks: any[];
  growthHacksPriorityMatrix: any[];
};

class Content extends React.Component<Props> {
  render() {
    const { growthHacks } = this.props;

    const growthHacksPriorityMatrix = this.props.growthHacksPriorityMatrix.map(
      gh => ({
        y: gh.impact,
        x: gh.ease,
        name: gh.name
      })
    );

    return (
      <ContentContainer>
        <Left growthHacks={growthHacks} />
        <Chart datas={growthHacksPriorityMatrix} />
      </ContentContainer>
    );
  }
}

export default Content;
