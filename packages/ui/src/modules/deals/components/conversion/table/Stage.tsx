import { IConversionStage } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import Spinner from 'modules/common/components/Spinner';
import * as React from 'react';
import Collapse from 'react-bootstrap/Collapse';
import { IDeal } from '../../../types';
import { BodyRow, StageName } from '../style';
import DealList from './DealList';

type Props = {
  stage: IConversionStage;
  deals: IDeal[];
  loadMore: () => void;
  hasMore: boolean;
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
    return parseInt(`${(b * 100) / a}`, 10);
  };

  renderDealList = () => {
    const { stage, deals, loadingDeals, hasMore } = this.props;

    if (loadingDeals) {
      return <Spinner />;
    }

    return (
      <DealList
        hasMore={hasMore}
        loadMore={this.loadMore}
        listId={stage._id}
        listType="DEAL"
        stageId={stage._id}
        deals={deals}
      />
    );
  };

  isCollabsible = () => {
    if (this.props.stage.initialDealsTotalCount === 0) {
      return false;
    }

    return true;
  };

  renderLostInfo = () => {
    const { stage } = this.props;

    const primary = stage.initialDealsTotalCount || 1;
    const stayed = stage.stayedDealsTotalCount || 0;
    const inProcess = stage.inProcessDealsTotalCount || 0;
    const lost = (stage.initialDealsTotalCount || 0) - inProcess - stayed;

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
    const isCollabsible = this.isCollabsible();

    return (
      <>
        <BodyRow onClick={isCollabsible ? this.toggleCollapse : undefined}>
          <StageName
            open={this.state.showCollapse}
            isCollabsible={isCollabsible}
          >
            {stage.name} <label>({stage.initialDealsTotalCount})</label>
            {isCollabsible && <Icon icon="angle-down" />}
          </StageName>
          {this.renderLostInfo()}
        </BodyRow>
        {this.renderCollapsibleContent()}
      </>
    );
  }
}
