import { Board, MainActionBar } from 'modules/boards/containers';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from 'modules/boards/styles/common';
import { __ } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import { Header } from 'modules/layout/components';
import * as React from 'react';
import { TaskMainActionBar } from '.';
import options from '../options';

type Props = {
  queryParams: any;
};
class TaskBoard extends React.Component<Props> {
  renderContent() {
    const { queryParams } = this.props;

    return <Board queryParams={queryParams} options={options} />;
  }

  renderActionBar() {
    return <MainActionBar type="task" component={TaskMainActionBar} />;
  }

  render() {
    return (
      <BoardContainer>
        <Header title={__('Task')} submenu={menuInbox} />
        <BoardContent transparent={true}>
          {this.renderActionBar()}
          <ScrolledContent transparent={true}>
            {this.renderContent()}
          </ScrolledContent>
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default TaskBoard;
