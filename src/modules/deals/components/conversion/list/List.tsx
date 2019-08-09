import { IStage } from 'modules/boards/types';
import * as React from 'react';
import { Result } from '../style';
import Stage from './Stage';

type Props = {
  stages: IStage[];
};

class List extends React.Component<Props, {}> {
  calcSpace = (lenght: number, index: number) => {
    return 100 - (index * (100 / lenght)) / 1.5;
  };

  renderFooter() {
    const { stages } = this.props;

    if (stages.length === 0) {
      return;
    }

    const firstStage: IStage = stages[0] || {};
    const lastStage: IStage = stages.slice(-1)[0] || {};

    const firstStageInitialDealsTotalCount =
      firstStage.initialDealsTotalCount || 1;

    const lastStageItemsTotalCount = lastStage.itemsTotalCount || 0;

    const avarage =
      (lastStageItemsTotalCount * 100) / firstStageInitialDealsTotalCount;

    return <Result>Winrate: {parseInt(`${avarage}`, 10)}%</Result>;
  }

  render() {
    const { stages } = this.props;

    const contents = stages.map((stage: IStage, index: number) => (
      <Stage
        spacing={this.calcSpace(stages.length, index)}
        key={index}
        stage={stage}
      />
    ));

    return (
      <>
        {contents}
        {this.renderFooter()}
      </>
    );
  }
}

export default List;
