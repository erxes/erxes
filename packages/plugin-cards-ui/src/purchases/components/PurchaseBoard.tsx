import Board from '@erxes/ui-cards/src/boards/containers/Board';
import MainActionBar from '@erxes/ui-cards/src/boards/containers/MainActionBar';
import {
  BoardContainer,
  BoardContent
} from '@erxes/ui-cards/src/boards/styles/common';
import { __ } from '@erxes/ui/src/utils/core';
import Header from '@erxes/ui/src/layout/components/Header';
import React from 'react';
import PurchaseMainActionBar from './PurchaseMainActionBar';
import options from '@erxes/ui-cards/src/purchases/options';

type Props = {
  queryParams: any;
  viewType: string;
};

class PurchaseBoard extends React.Component<Props> {
  renderContent() {
    const { queryParams, viewType } = this.props;

    return (
      <Board viewType={viewType} queryParams={queryParams} options={options} />
    );
  }

  renderActionBar() {
    return <MainActionBar type="purchase" component={PurchaseMainActionBar} />;
  }

  render() {
    const breadcrumb = [{ title: __('Purchase pipeline') }];

    return (
      <BoardContainer>
        <Header title={__('Purchase')} breadcrumb={breadcrumb} />
        <BoardContent transparent={true}>
          {this.renderActionBar()}
          {this.renderContent()}
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default PurchaseBoard;
