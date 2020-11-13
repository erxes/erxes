import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import Header from 'modules/layout/components/Header';
import Wrapper from 'modules/layout/components/Wrapper';
import { ICalendar, IGroup } from 'modules/settings/calendars/types';
import React from 'react';
import { TYPES } from '../constants';
import Event from '../containers/Event';
import LeftSidebar from '../containers/Sidebar';
import { MainContainer } from '../styles';
import { generateFilters } from '../utils';
import MainActionBar from './MainActionBar';

type Props = {
  history: any;
  queryParams: any;
  currentGroup?: IGroup;
  currentCalendar?: ICalendar;
  groups: IGroup[];
};

type State = {
  currentDate: Date;
  type: string;
};

class Calendar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentDate: new Date(),
      type: TYPES.MONTH
    };
  }

  typeOnChange = item => {
    this.setState({ type: item.value });
  };

  dateOnChange = date => {
    this.setState({ currentDate: date });
  };

  render() {
    const { type, currentDate } = this.state;
    const {
      history,
      queryParams,
      currentCalendar,
      currentGroup,
      groups
    } = this.props;

    return (
      <BoardContainer>
        <Header title="Calendar" />
        <BoardContent transparent={true}>
          <MainActionBar
            currentCalendar={currentCalendar}
            currentGroup={currentGroup}
            groups={groups}
          />
          {currentCalendar ? (
            <Wrapper
              leftSidebar={
                <LeftSidebar
                  dateOnChange={this.dateOnChange}
                  currentDate={currentDate}
                  typeOnChange={this.typeOnChange}
                  type={type}
                  accountId={currentCalendar.accountId}
                  history={history}
                  queryParams={queryParams}
                  {...generateFilters(currentDate, type)}
                />
              }
              content={
                <>
                  <MainContainer>
                    <Event
                      {...generateFilters(currentDate, type)}
                      type={type}
                      currentDate={currentDate}
                      accountId={currentCalendar.accountId}
                      queryParams={queryParams}
                    />
                  </MainContainer>
                </>
              }
              transparent={true}
            />
          ) : (
            <MainContainer>
              <EmptyState
                icon="calendar-alt"
                text="No Calendar"
                extra={
                  <Button
                    btnStyle="success"
                    size="small"
                    href={'/settings/calendars'}
                  >
                    Add Calendar
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
