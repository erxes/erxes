import { __ } from 'modules/common/utils';
import { LoadingContent } from 'modules/deals/styles/stage';
import { IDeal, IStage } from 'modules/deals/types';
import * as React from 'react';
import { Collapse } from 'react-bootstrap';
import { Body } from '../style';
import { DealList } from './';

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

  toggleCollapse = () => {
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

  renderLostInfo() {
    const { stage } = this.props;

    const stayed = stage.stayedDealsTotalCount || 0;
    const inProcess = stage.inProcessDealsTotalCount || 0;
    const lost = (stage.primaryDealsTotalCount || 0) - inProcess - stayed;

    return (
      <>
        <span>{stayed}</span>
        <span>{inProcess}</span>
        <span>{lost}</span>
      </>
    );
  }

  renderCollapsibleContent() {
    if (this.props.stage.primaryDealsTotalCount === 0) {
      return null;
    }

    return (
      <Collapse in={this.state.showCollapse}>
        <div>{this.renderDealList()}</div>
      </Collapse>
    );
  }

  render() {
    const { stage } = this.props;

    return (
      <>
        <Body onClick={this.toggleCollapse}>
          <span>
            {stage.name} ({stage.primaryDealsTotalCount})
          </span>
          {this.renderLostInfo()}
        </Body>
        {this.renderCollapsibleContent()}
      </>
    );
  }
}
