import { IConversionStagePurchase } from '@erxes/ui-cards/src/boards/types';
import Icon from '@erxes/ui/src/components/Icon';
import * as React from 'react';
import {
  Content,
  Lost,
  Name,
  StageContainer,
  StageWrap,
  Stayed,
  Values
} from '../style';

type Props = {
  stage: IConversionStagePurchase;
  spacing: number;
};

class Stage extends React.Component<Props> {
  renderLostInfo(info) {
    if (info.count || info.count >= 0) {
      const lost = info.count < 0 ? 0 : info.count;

      const percent = info.percent ? parseInt(info.percent, 10) : 0;

      return (
        <Values>
          <Lost>Lost: {lost}</Lost>
          <span>
            {percent}% <Icon icon="angle-down" />
          </span>
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
              {stage.itemsTotalCount} /{' '}
              <span>{stage.initialPurchasesTotalCount}</span>
            </Stayed>
          </Content>
          {this.renderLostInfo(stage.compareNextStagePurchase)}
        </StageContainer>
      </StageWrap>
    );
  }
}

export default Stage;
