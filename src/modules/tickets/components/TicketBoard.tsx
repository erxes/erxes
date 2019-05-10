import { __ } from 'modules/common/utils';
import { MainActionBar } from 'modules/deals/containers';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from 'modules/deals/styles/common';
import { Header } from 'modules/layout/components';
import * as React from 'react';

type Props = {
  queryParams: any;
};

class DealBoard extends React.Component<Props> {
  // renderContent() {
  //   const { queryParams } = this.props;

  //   return <Board queryParams={queryParams} />;
  // }

  render() {
    const title = __('Ticket');

    return (
      <BoardContainer>
        <Header title={title} breadcrumb={[{ title }]} />
        <BoardContent transparent={true}>
          <MainActionBar />
          <ScrolledContent transparent={true}>
            {/* {this.renderContent()} */}
          </ScrolledContent>
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default DealBoard;
