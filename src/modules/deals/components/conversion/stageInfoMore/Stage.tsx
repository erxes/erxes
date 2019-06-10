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
import DealList from './DealList';

type Props = {
  stage: IStage;
  deals: IDeal[];
  loadMore: () => void;
  loadingDeals: boolean;
};

type State = {
  showCollapse: boolean;
};

export default class Stage extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      showCollapse: false
    };
  }

  showCollapse = () => {
    this.setState({
      showCollapse: !this.state.showCollapse
    });
  };

  loadMore = () => {
    this.props.loadMore();
  };

  renderDealList() {
    const { stage, deals, loadingDeals } = this.props;

    if (loadingDeals) {
      return (
        <LoadingContent>
          <img src="/images/loading-content.gif" />
        </LoadingContent>
      );
    }

    return (
      <DealList
        listId={stage._id}
        listType="DEAL"
        stageId={stage._id}
        deals={deals}
      />
    );
  }

  renderLostInfo(info) {
    const { stage } = this.props;

    const stayed = stage.stayedDealsTotalCount || 0;
    const inProcess = stage.inProcessDealsTotalCount || 0;
    const lost = (stage.primaryDealsTotalCount || 0) - inProcess - stayed;

    const content = `stayed: ${stayed} inProcess: ${inProcess} lost: ${lost}`;
    return (
      <Footer>
        <SpaceContent>{content}</SpaceContent>
      </Footer>
    );
  }

  render() {
    const { stage } = this.props;
    const { showCollapse } = this.state;

    return (
      <DealContainer>
        <Content>
          <SpaceContent>
            <button onClick={this.showCollapse}>show</button>
            <h5>
              {stage.name}({stage.primaryDealsTotalCount})
            </h5>
          </SpaceContent>
        </Content>
        {this.renderLostInfo(stage.stageInfo)}
        <Collapse in={showCollapse}>{this.renderDealList()}</Collapse>
      </DealContainer>
    );
  }
}
