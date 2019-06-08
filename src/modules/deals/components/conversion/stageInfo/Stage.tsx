import { Content } from 'modules/deals/styles/stage';

import * as React from 'react';
import { __ } from '../../../../common/utils';
import {
  Deal as DealContainer,
  Footer,
  SpaceContent
} from '../../../styles/deal';
import { IStage } from '../../../types';

type Props = {
  stage: IStage;
};

class Stage extends React.Component<Props> {
  renderLostInfo(info) {
    if (info.count) {
      const content = `lost: ${info.count < 0 ? 0 : info.count} ${parseInt(
        info.percent,
        10
      )}%`;
      return (
        <Footer>
          <SpaceContent>{content}</SpaceContent>
        </Footer>
      );
    }
    return;
  }
  render() {
    const { stage } = this.props;

    return (
      <DealContainer>
        <Content>
          <SpaceContent>
            <h5>{stage.name}</h5>
          </SpaceContent>
          <SpaceContent>
            <h5>
              {stage.dealsTotalCount} / {stage.primaryDealsTotalCount}
            </h5>
          </SpaceContent>
        </Content>
        {this.renderLostInfo(stage.stageInfo)}
      </DealContainer>
    );
  }
}

export default Stage;
