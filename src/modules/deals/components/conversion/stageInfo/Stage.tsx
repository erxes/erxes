import { __ } from 'modules/common/utils';
import * as React from 'react';
import { IStage } from '../../../types';
import {
  Content,
  Name,
  StageContainer,
  StageWrap,
  Stayed,
  Values
} from '../stytle';

type Props = {
  stage: IStage;
  spacing: number;
};

class Stage extends React.Component<Props> {
  renderLostInfo(info) {
    if (info.count || info.count >= 0) {
      const lost = info.count < 0 ? 0 : info.count;

      const percent = info.percent ? parseInt(info.percent, 10) : 0;
      const content = `lost: ${lost} ${percent}%`;

      return (
        <Values>
          <span>{content}</span>
        </Values>
      );
    }
    return;
  }
  render() {
    const { stage, spacing } = this.props;

    return (
      <StageWrap>
        <StageContainer spacing={spacing}>
          <Content>
            <Name>{stage.name}</Name>
            <Stayed>
              {stage.dealsTotalCount} /{' '}
              <span>{stage.primaryDealsTotalCount}</span>
            </Stayed>
          </Content>
          {this.renderLostInfo(stage.stageInfo)}
        </StageContainer>
      </StageWrap>
    );
  }
}

export default Stage;
