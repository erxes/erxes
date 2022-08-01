import MainActionBar from '@erxes/ui-cards/src/boards/containers/MainActionBar';
import {
  BoardContainer,
  BoardContent
} from '@erxes/ui-cards/src/boards/styles/common';
import { __ } from '@erxes/ui/src/utils/core';
import Header from '@erxes/ui/src/layout/components/Header';
import React from 'react';
import Content from '../../containers/priorityMatrix/Content';
import GrowthHackMainActionBar from '../GrowthHackMainActionBar';

type Props = {
  queryParams: any;
};

class PriorityMatrix extends React.Component<Props> {
  renderContent = () => <Content queryParams={this.props.queryParams} />;

  renderActionBar = () => (
    <MainActionBar type="growthHack" component={GrowthHackMainActionBar} />
  );

  render() {
    const breadcrumb = [
      { title: __('Growth hacking'), link: '/growthHack/board' },
      { title: __('Priority matrix') }
    ];

    return (
      <BoardContainer>
        <Header title={__('Growth hacking')} breadcrumb={breadcrumb} />
        <BoardContent transparent={true}>
          {this.renderActionBar()}
          {this.renderContent()}
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default PriorityMatrix;
