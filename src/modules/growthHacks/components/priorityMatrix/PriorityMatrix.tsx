import MainActionBar from 'modules/boards/containers/MainActionBar';
import { BoardContainer } from 'modules/boards/styles/common';
import { __ } from 'modules/common/utils';
import Header from 'modules/layout/components/Header';
import { MainContent } from 'modules/layout/styles';
import React from 'react';
import Left from '../../containers/priorityMatrix/Left';
import GrowthHackMainActionBar from '../GrowthHackMainActionBar';

type Props = {
  queryParams: any;
};

class PriorityMatrix extends React.Component<Props> {
  renderContent() {
    const { queryParams } = this.props;

    return (
      <>
        <Left queryParams={queryParams} />
      </>
    );
  }

  renderActionBar() {
    return (
      <MainActionBar type="growthHack" component={GrowthHackMainActionBar} />
    );
  }

  render() {
    const breadcrumb = [{ title: __('Growth hack') }];

    return (
      <BoardContainer>
        <Header title={__('Growth hack')} breadcrumb={breadcrumb} />
        <MainContent transparent={true} style={{ margin: 0 }}>
          {this.renderActionBar()}
          {this.renderContent()}
        </MainContent>
      </BoardContainer>
    );
  }
}

export default PriorityMatrix;
