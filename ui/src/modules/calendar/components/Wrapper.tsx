import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { TYPES } from '../constants';
import Event from '../containers/Event';
import { MainContainer } from '../styles';
import { IAccount } from '../types';
import { generateFilters } from '../utils';
import Sidebar from './LeftSidebar';

type Props = {
  history: any;
  queryParams: any;
  accounts: IAccount[];
};

type State = {
  currentDate: Date;
  type: string;
  calendarIds: string[];
};

interface IStore {
  accounts: IAccount[];
  color: object;
}

const CalendarContext = React.createContext({} as IStore);

export const CalendarConsumer = CalendarContext.Consumer;

class CalendarWrapper extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentDate: new Date(),
      type: TYPES.MONTH,
      calendarIds: []
    };
  }

  typeOnChange = item => {
    this.setState({ type: item.value });
  };

  dateOnChange = date => {
    this.setState({ currentDate: date });
  };

  onChangeCalendarIds = calendarIds => {
    this.setState({ calendarIds });
  };

  setColors() {
    const color = {};

    this.props.accounts.map(acc => {
      return acc.calendars.map(calendar => {
        return (color[calendar.providerCalendarId] = acc.color);
      });
    });

    return color;
  }

  render() {
    const { type, currentDate, calendarIds } = this.state;
    const { history, queryParams, accounts } = this.props;

    const mainContent = (
      <Wrapper
        leftSidebar={
          <Sidebar
            dateOnChange={this.dateOnChange}
            currentDate={currentDate}
            typeOnChange={this.typeOnChange}
            type={type}
            history={history}
            queryParams={queryParams}
            {...generateFilters(currentDate, type)}
            onChangeCalendarIds={this.onChangeCalendarIds}
            accounts={accounts}
          />
        }
        content={
          <>
            <MainContainer>
              <Event
                {...generateFilters(currentDate, type)}
                type={type}
                currentDate={currentDate}
                calendarIds={calendarIds}
                queryParams={queryParams}
              />
            </MainContainer>
          </>
        }
        transparent={true}
      />
    );

    return (
      <CalendarContext.Provider value={{ accounts, color: this.setColors() }}>
        {mainContent}
      </CalendarContext.Provider>
    );
  }
}

export default CalendarWrapper;
