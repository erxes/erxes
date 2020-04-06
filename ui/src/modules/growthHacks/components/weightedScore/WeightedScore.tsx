import MainActionBar from 'modules/boards/containers/MainActionBar';
import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { IGrowthHack, IGrowthHackParams } from 'modules/growthHacks/types';
import Header from 'modules/layout/components/Header';
import React from 'react';
import GrowthHackMainActionBar from '../GrowthHackMainActionBar';
import Content from './Content';

type Props = {
  queryParams: any;
  growthHacks: IGrowthHack[];
  refetch?: () => void;
  totalCount: number;
  loading: boolean;
  save(id: string, doc: IGrowthHackParams): void;
};

class WeightedScore extends React.Component<Props> {
  renderActionBar = () => (
    <MainActionBar type="growthHack" component={GrowthHackMainActionBar} />
  );

  render() {
    const breadcrumb = [
      { title: __('Growth hacking'), link: '/growthHack/board' },
      { title: __('Weighted scoring') }
    ];

    return (
      <BoardContainer>
        <Header title={__('Growth hacking')} breadcrumb={breadcrumb} />
        <BoardContent transparent={true} bgColor={colors.bgMain}>
          {this.renderActionBar()}
          <Content {...this.props} />
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default WeightedScore;
