import { FunnelContent, Title } from 'modules/growthHacks/styles';
import { IGrowthHack } from 'modules/growthHacks/types';
import React from 'react';
import GrowthHacks from './GrowthHacks';

type Props = {
  queryParams: any;
  hackStage: string;
  isOpen: boolean;
  growthHacks?: IGrowthHack[];
  totalCount: number;
  loading: boolean;
  onChangeOpen(hackStage: string, isOpen: boolean): void;
  refetch?(): void;
};

class FunnelGroup extends React.Component<Props> {
  onChangeOpen = () => {
    const { onChangeOpen, isOpen, hackStage } = this.props;

    onChangeOpen(hackStage, isOpen);
  };

  render() {
    const {
      hackStage,
      queryParams,
      growthHacks,
      totalCount,
      loading,
      refetch
    } = this.props;

    return (
      <FunnelContent>
        <Title onClick={this.onChangeOpen}>
          {hackStage} ({totalCount})
        </Title>

        {this.props.isOpen ? (
          <GrowthHacks
            queryParams={queryParams}
            growthHacks={growthHacks}
            totalCount={totalCount}
            loading={loading}
            refetch={refetch}
          />
        ) : null}
      </FunnelContent>
    );
  }
}

export default FunnelGroup;
