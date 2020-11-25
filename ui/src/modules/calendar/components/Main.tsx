import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import { __ } from 'modules/common/utils';
import Header from 'modules/layout/components/Header';
import { IBoard, IGroup } from 'modules/settings/calendars/types';
import React from 'react';
import Wrapper from '../containers/Wrapper';
import { MainContainer } from '../styles';
import MainActionBar from './MainActionBar';

type Props = {
  history: any;
  queryParams: any;
  currentBoard?: IBoard;
  currentGroup?: IGroup;
  boards: IBoard[];
};

const breadcrumb = [{ title: __('Calendar'), link: '/calendar' }];
class Calendar extends React.Component<Props> {
  render() {
    const {
      history,
      queryParams,
      currentGroup,
      currentBoard,
      boards
    } = this.props;

    return (
      <BoardContainer>
        <Header title="Calendar" breadcrumb={breadcrumb} />
        <BoardContent transparent={true}>
          <MainActionBar
            currentGroup={currentGroup}
            currentBoard={currentBoard}
            boards={boards}
          />
          {currentGroup ? (
            <Wrapper
              queryParams={queryParams}
              history={history}
              currentGroup={currentGroup}
            />
          ) : (
            <MainContainer>
              <EmptyState
                icon="calendar-alt"
                text="No Group"
                extra={
                  <Button
                    btnStyle="success"
                    size="small"
                    href={'/settings/calendars'}
                  >
                    Add Group
                  </Button>
                }
              />
            </MainContainer>
          )}
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default Calendar;
