import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Event from '../containers/Event';
import LeftSidebar from '../containers/Sidebar';
import { MainContainer } from '../styles';
import { TYPES } from '../constants';
import { generateFilters } from '../utils';
import EmptyState from 'modules/common/components/EmptyState';
import Button from 'modules/common/components/Button';
import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import Header from 'modules/layout/components/Header';
import MainActionBar from './MainActionBar';
import { IGroup, ICalendar } from 'modules/settings/calendars/types';

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
                  integrationId={currentCalendar.integrationId}
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
                      integrationId={currentCalendar.integrationId}
                      queryParams={queryParams}
                    />
                  </MainContainer>
                </>
              }
              transparent={true}
            />
          ) : (
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
          )}
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default Calendar;
