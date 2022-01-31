import { IConversionStage } from 'modules/boards/types';
import * as React from 'react';
import { Result } from '../style';
import Stage from './Stage';

type Props = {
  stages: IConversionStage[];
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

    const firstStage: IConversionStage = stages[0] || {};
    const lastStage: IConversionStage = stages.slice(-1)[0] || {};

    const firstStageInitialDealsTotalCount =
      firstStage.initialDealsTotalCount || 1;

    const lastStageItemsTotalCount = lastStage.itemsTotalCount || 0;

    const Average =
      (lastStageItemsTotalCount * 100) / firstStageInitialDealsTotalCount;

    return <Result>Winrate: {parseInt(`${Average}`, 10)}%</Result>;
  }

  render() {
    const { stages } = this.props;

    const contents = stages.map((stage: IConversionStage, index: number) => (
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
