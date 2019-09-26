import Left from 'modules/growthHacks/containers/priorityMatrix/Left';
import { ContentContainer } from 'modules/growthHacks/styles';
import React from 'react';
import Chart from './Chart';

type Props = {
  queryParams: any;
  growthHacksPriorityMatrix: any[];
  priorityMatrixRefetch: () => void;
};

class Content extends React.Component<Props> {
  render() {
    const {
      growthHacksPriorityMatrix,
      priorityMatrixRefetch,
      queryParams
    } = this.props;

    const datas = growthHacksPriorityMatrix.map(gh => ({
      y: gh.impact,
      x: gh.ease,
      name: gh.name
    }));

    return (
      <ContentContainer>
        <Left
          priorityMatrixRefetch={priorityMatrixRefetch}
          queryParams={queryParams}
        />
        <Chart datas={datas} />
      </ContentContainer>
    );
  }
}

export default Content;
