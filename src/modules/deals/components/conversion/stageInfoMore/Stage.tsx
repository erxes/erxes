import { __ } from 'modules/common/utils';
import { LoadingContent } from 'modules/deals/styles/stage';
import { IDeal, IStage } from 'modules/deals/types';
import * as React from 'react';
import { Collapse } from 'react-bootstrap';
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
      showCollapse: true
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

  renderLostInfo() {
    const { stage } = this.props;

    const stayed = stage.stayedDealsTotalCount || 0;
    const inProcess = stage.inProcessDealsTotalCount || 0;
    const lost = (stage.primaryDealsTotalCount || 0) - inProcess - stayed;

    return (
      <>
        <td>{stayed}</td>
        <td>{inProcess}</td>
        <td>{lost}</td>
      </>
    );
  }

  render() {
    const { stage } = this.props;
    const { showCollapse } = this.state;

    return (
      <>
        <tr>
          <td onClick={this.showCollapse}>
            {stage.name} ({stage.primaryDealsTotalCount})
          </td>
          {this.renderLostInfo()}
        </tr>
        <Collapse in={showCollapse}>{this.renderDealList()}</Collapse>
      </>
    );
  }
}
