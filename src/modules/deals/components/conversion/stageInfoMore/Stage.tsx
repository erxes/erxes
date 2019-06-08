import { EmptyState } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { LoadingContent } from 'modules/deals/styles/stage';
import { Content } from 'modules/deals/styles/stage';
import { IDeal, IStage } from 'modules/deals/types';
import * as React from 'react';
import { Collapse } from 'react-bootstrap';
import {
  Deal as DealContainer,
  Footer,
  SpaceContent
} from '../../../styles/deal';

type Props = {
  stage: IStage;
  deals: IDeal[];
  loadMore: () => void;
  loadingDeals: boolean;
};
export default class Stage extends React.Component<Props, {}> {
  loadMore = () => {
    this.props.loadMore();
  };
  renderDealList() {
    const { stage, deals } = this.props;

    return <div>sdasd</div>;
  }

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
    console.log('xaxa', this.props.deals);
    return (
      <DealContainer>
        <Content>
          <SpaceContent>
            <button onClick={this.loadMore}>sda</button>
            <h5>
              {stage.name}({stage.primaryDealsTotalCount})
            </h5>
          </SpaceContent>
        </Content>
        {this.renderLostInfo(stage.stageInfo)}
      </DealContainer>
    );
  }
}
