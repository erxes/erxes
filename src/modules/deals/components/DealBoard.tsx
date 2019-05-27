import { IQueryParams } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import { Header } from 'modules/layout/components';
import * as React from 'react';
import { Board, MainActionBar } from '../containers';
import DealProvider, { DealConsumer } from '../containers/DealContext';
import withPipelineDetail from '../containers/withPipeline';
import { BoardContainer, BoardContent } from '../styles/common';
import { IPipeline } from '../types';

type Props = {
  queryParams: IQueryParams;
  pipeline: IPipeline;
};

class DealBoard extends React.Component<Props> {
  renderContent(backgroundColor: string = '') {
    const { queryParams, pipeline } = this.props;

    return (
      <Board
        queryParams={queryParams}
        pipeline={pipeline}
        backgroundColor={backgroundColor}
      />
    );
  }

  renderActionBar() {
    return <MainActionBar />;
  }

  render() {
    return (
      <DealProvider>
        <DealConsumer>
          {({ backgroundColor }) => (
            <BoardContainer>
              <Header title={__('Deal')} submenu={menuDeal} />
              <BoardContent transparent={true}>
                {this.renderActionBar()}
                {this.renderContent(backgroundColor)}
              </BoardContent>
            </BoardContainer>
          )}
        </DealConsumer>
      </DealProvider>
    );
  }
}

export default withPipelineDetail(DealBoard);
