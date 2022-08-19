import MainActionBar from '@erxes/ui-cards/src/boards/containers/MainActionBar';
import {
  BoardContainer,
  BoardContent
} from '@erxes/ui-cards/src/boards/styles/common';
import { colors } from '@erxes/ui/src/styles';
import { __ } from '@erxes/ui/src/utils/core';
import { IGrowthHack, IGrowthHackParams } from '../../types';
import Header from '@erxes/ui/src/layout/components/Header';
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
