import { LoadingContent } from 'modules/boards/styles/stage';
import { IStage } from 'modules/boards/types';
import * as React from 'react';
import { Collapse } from 'react-bootstrap';
import { IDeal } from '../../../types';
import { BodyRow, StageName } from '../style';
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

  calculatePercent = (a: number, b: number) => {
    return (b * 100) / a;
  };

  renderDealList = () => {
    const { stage, deals, loadingDeals } = this.props;

    if (loadingDeals) {
      return (
        <LoadingContent>
          <img src="/images/loading-content.gif" alt="Loading" />
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
  };

  isCollabsible = () => {
    if (this.props.stage.primaryDealsTotalCount === 0) {
      return false;
    }

    return true;
  };

  renderLostInfo = () => {
    const { stage } = this.props;

    const primary = stage.primaryDealsTotalCount || 1;
    const stayed = stage.stayedDealsTotalCount || 0;
    const inProcess = stage.inProcessDealsTotalCount || 0;
    const lost = (stage.primaryDealsTotalCount || 0) - inProcess - stayed;

    return (
      <>
        <span>
          {stayed} / {this.calculatePercent(primary, stayed)}%
        </span>
        <span>
          {inProcess} / {this.calculatePercent(primary, inProcess)}%
        </span>
        <span>
          {lost} / {this.calculatePercent(primary, lost)}%
        </span>
      </>
    );
  };

  renderCollapsibleContent = () => {
    if (!this.isCollabsible()) {
      return null;
    }

    return (
      <Collapse in={this.state.showCollapse}>
        <div>{this.renderDealList()}</div>
      </Collapse>
    );
  };

  render() {
    const { stage } = this.props;

    return (
      <>
        <BodyRow
          onClick={this.isCollabsible() ? this.toggleCollapse : undefined}
        >
          <StageName open={this.state.showCollapse}>
            {stage.name} <label>({stage.primaryDealsTotalCount})</label>
          </StageName>
          {this.renderLostInfo()}
        </BodyRow>
        {this.renderCollapsibleContent()}
      </>
    );
  }
}
