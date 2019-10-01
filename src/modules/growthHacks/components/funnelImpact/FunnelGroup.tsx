import PriorityIndicator from 'modules/boards/components/editForm/PriorityIndicator';
import Icon from 'modules/common/components/Icon';
import { FunnelContent, Title } from 'modules/growthHacks/styles';
import { IGrowthHack } from 'modules/growthHacks/types';
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

  render() {
    const {
      hackStage,
      queryParams,
      growthHacks,
      totalCount,
      isOpen
    } = this.props;

    return (
      <FunnelContent>
        <Title onClick={this.onToggle}>
          <div>
            <Icon icon={isOpen ? 'downarrow' : 'rightarrow-2'} />
            <PriorityIndicator value={hackStage} isFullBackground={true} />
          </div>
          <span>
            Count <b>{totalCount}</b>
          </span>
        </Title>

        {this.props.isOpen ? (
          <GrowthHacks queryParams={queryParams} growthHacks={growthHacks} />
        ) : null}
      </FunnelContent>
    );
  }
}

export default FunnelGroup;
