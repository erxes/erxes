import { IStage } from 'modules/boards/types';
import { EmptyState } from 'modules/common/components';
import * as React from 'react';
import { Container, ContentBody, Result } from '../style';
import Stage from './Stage';

type Props = {
  stages: IStage[];
};

class List extends React.Component<Props, {}> {
  calcSpace = (lenght: number, index: number) => {
    return 100 - ((index + 1) * (100 / lenght)) / 1.5;
  };

  renderContent() {
    const { stages } = this.props;
    if (stages.length === 0) {
      return <EmptyState icon="piggy-bank" text="No deal" />;
    }

    const contents = stages.map((stage: IStage, index: number) => (
      <Stage
        spacing={this.calcSpace(stages.length, index)}
        key={index}
        stage={stage}
      />
    ));

    return (
      <ContentBody>
        {contents}
        {this.renderFooter()}
      </ContentBody>
    );
  }

  renderFooter() {
    const { stages } = this.props;

    if (stages.length === 0) {
      return;
    } else {
      const firstStage: IStage = stages[0] || {};
      const lastStage: IStage = stages.slice(-1)[0] || {};

      const firstStagePrimaryDealsTotalCount =
        firstStage.primaryDealsTotalCount || 1;

      const lastStagePrimaryDealsTotalCount =
        lastStage.primaryDealsTotalCount || 0;

      const avarage =
        (lastStagePrimaryDealsTotalCount * 100) /
        firstStagePrimaryDealsTotalCount;

      return (
        <>
          <Result>Winrate: {avarage}%</Result>
          <Result>Avarage won deal value: {avarage}%</Result>
        </>
      );
    }
  }

  render() {
    return <Container>{this.renderContent()}</Container>;
  }
}

export default List;
