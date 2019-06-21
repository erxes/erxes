import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import { Header } from 'modules/layout/components';
import * as React from 'react';
import { Board, MainActionBar } from '../containers';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from '../styles/common';

type Props = {
  queryParams: any;
};

function DealBoard({ queryParams }: Props) {
  return (
    <BoardContainer>
      <Header title={__('Deal')} submenu={menuDeal} />
      <BoardContent transparent={true}>
        <MainActionBar />
        <ScrolledContent transparent={true}>
          <Board queryParams={queryParams} />
        </ScrolledContent>
      </BoardContent>
    </BoardContainer>
  );
}

export default DealBoard;
