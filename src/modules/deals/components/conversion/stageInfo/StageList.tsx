import { EmptyState } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';
import { IStage } from '../../../types';
import Stage from './Stage';

type Props = {
  stages: IStage[];
};

const Container = styled.div`
  position: relative;
  height: 100%;
  overflow: auto;
`;

const ContentBody = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 0 4px;
  margin: 0 4px;
  overflow-y: auto;
`;

class StageList extends React.Component<Props, {}> {
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
        firstStage.primaryDealsTotalCount || 0;

      const lastStagePrimaryDealsTotalCount =
        lastStage.primaryDealsTotalCount || 0;

      const avarage =
        (lastStagePrimaryDealsTotalCount * 100) /
        firstStagePrimaryDealsTotalCount;

      return <div>Avarage wondeal value: {avarage}%</div>;
    }
  }

  render() {
    return <Container>{this.renderContent()}</Container>;
  }
}

export default StageList;
