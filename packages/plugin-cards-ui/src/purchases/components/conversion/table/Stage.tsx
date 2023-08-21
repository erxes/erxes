import { IConversionStagePurchase } from '@erxes/ui-cards/src/boards/types';
import Icon from '@erxes/ui/src/components/Icon';
import Spinner from '@erxes/ui/src/components/Spinner';
import * as React from 'react';
import Collapse from 'react-bootstrap/Collapse';
import { IPurchase } from '@erxes/ui-cards/src/purchases/types';
import { BodyRow, StageName } from '../style';
import PurchaseList from './PurchaseList';

type Props = {
  stage: IConversionStagePurchase;
  purchases: IPurchase[];
  loadMore: () => void;
  hasMore: boolean;
  loadingPurchases: boolean;
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

  renderPurchaseList = () => {
    const { stage, purchases, loadingPurchases, hasMore } = this.props;

    if (loadingPurchases) {
      return <Spinner />;
    }

    return (
      <PurchaseList
        hasMore={hasMore}
        loadMore={this.loadMore}
        listId={stage._id}
        listType="PURCHASE"
        stageId={stage._id}
        purchases={purchases}
      />
    );
  };

  isCollabsible = () => {
    if (this.props.stage.initialPurchasesTotalCount === 0) {
      return false;
    }

    return true;
  };

  renderLostInfo = () => {
    const { stage } = this.props;

    const primary = stage.initialPurchasesTotalCount || 1;
    const stayed = stage.stayedPurchasesTotalCount || 0;
    const inProcess = stage.inProcessPurchasesTotalCount || 0;
    const lost = (stage.initialPurchasesTotalCount || 0) - inProcess - stayed;

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
        <div>{this.renderPurchaseList()}</div>
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
            {stage.name} <label>({stage.initialPurchasesTotalCount})</label>
            {isCollabsible && <Icon icon="angle-down" />}
          </StageName>
          {this.renderLostInfo()}
        </BodyRow>
        {this.renderCollapsibleContent()}
      </>
    );
  }
}
