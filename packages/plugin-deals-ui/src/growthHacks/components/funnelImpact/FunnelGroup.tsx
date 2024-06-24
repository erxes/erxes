import PriorityIndicator from '@erxes/ui-cards/src/boards/components/editForm/PriorityIndicator';
import Icon from '@erxes/ui/src/components/Icon';
import { FunnelContent, Title } from '../../styles';
import { IGrowthHack } from '../../types';
import React from 'react';
import GrowthHacks from './GrowthHacks';

type Props = {
  queryParams: any;
  hackStage: string;
  isOpen: boolean;
  growthHacks: IGrowthHack[];
  totalCount: number;
  toggle(hackStage: string, isOpen: boolean): void;
};

class FunnelGroup extends React.Component<Props> {
  onToggle = () => {
    const { toggle, isOpen, hackStage } = this.props;

    toggle(hackStage, isOpen);
  };

  renderGrowthHacks = () => {
    if (!this.props.isOpen) {
      return null;
    }

    const { queryParams, growthHacks } = this.props;

    return <GrowthHacks queryParams={queryParams} growthHacks={growthHacks} />;
  };

  render() {
    const { hackStage, totalCount, isOpen } = this.props;

    return (
      <FunnelContent>
        <Title onClick={this.onToggle}>
          <div>
            <Icon icon={isOpen ? 'angle-down' : 'angle-right'} />
            <PriorityIndicator value={hackStage} isFullBackground={true} />
          </div>
          <span>
            Count: <b>{totalCount}</b>
          </span>
        </Title>

        {this.renderGrowthHacks()}
      </FunnelContent>
    );
  }
}

export default FunnelGroup;
