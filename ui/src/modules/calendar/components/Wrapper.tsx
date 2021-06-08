import dayjs from 'dayjs';
import { capitalize } from 'modules/activityLogs/utils';
import { IUser } from 'modules/auth/types';
import { ButtonGroup } from 'modules/boards/styles/header';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { IBoard, IGroup } from 'modules/settings/calendars/types';
import React from 'react';
import { TYPES } from '../constants';
import Event from '../containers/Event';
import { CalendarController } from '../styles';
import { IAccount } from '../types';
import { generateFilters } from '../utils';
import { extractDate } from '../utils';
import Sidebar from './LeftSidebar';

type Props = {
  history: any;
  queryParams: any;
  accounts: IAccount[];
  currentUser?: IUser;
  currentGroup: IGroup;
  currentBoard?: IBoard;
  boards: IBoard[];
};

type State = {
  currentDate: Date;
  type: string;
  calendarIds: string[];
};

interface IStore {
  accounts: IAccount[];
  color: object;
  currentUser?: IUser;
}

const CalendarContext = React.createContext({} as IStore);

export const CalendarConsumer = CalendarContext.Consumer;

const breadcrumb = [{ title: __('Calendar'), link: '/calendar' }];
class CalendarWrapper extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentDate: new Date(),
      type: TYPES.MONTH,
      calendarIds: []
    };
  }

  typeOnChange = type => {
    this.setState({ type });
  };

  dateOnChange = date => {
    this.setState({ currentDate: date });
  };

  onDayClick = date => {
    this.setState({ type: TYPES.DAY, currentDate: date });
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

  onChange = (increment: boolean) => {
    const { type, currentDate } = this.state;
    const { month, year, date } = extractDate(currentDate);

    let day: Date = currentDate;
    const inc = increment ? 1 : -1;

    if (type === TYPES.DAY) {
      day = new Date(year, month, date + inc);
    }

    if (type === TYPES.WEEK) {
      day = new Date(year, month, date + inc * 7);
    }

    if (type === TYPES.MONTH) {
      day = new Date(year, month + inc);
    }

    this.dateOnChange(day);
  };

  renderMonthController = () => {
    const { type, currentDate } = this.state;
    const onClick = () => {
      this.dateOnChange(new Date());
    };

    let format = 'MMMM YYYY';

    if (type === TYPES.DAY) {
      format = 'ddd, MMMM DD, YYYY';
    }

    return (
      <CalendarController>
        <Icon icon="angle-left" onClick={this.onChange.bind(this, false)} />
        <Icon icon="angle-right" onClick={this.onChange.bind(this, true)} />
        <h2>{dayjs(currentDate).format(format)}</h2>
        <Button btnStyle="simple" uppercase={false} onClick={onClick}>
          Today
        </Button>
      </CalendarController>
    );
  };

  renderOptions = (list: string[]) => {
    return list.map(item => ({ value: item, label: item.toUpperCase() }));
  };

  renderTypeChooser = () => {
    const { type } = this.state;

    return (
      <ButtonGroup>
        {TYPES.all.map(item => {
          const onClick = () => this.typeOnChange(item);

          return (
            <a
              key={item}
              href={`#${item}`}
              onClick={onClick}
              className={type === item ? 'active' : ''}
            >
              {capitalize(item)}
            </a>
          );
        })}
      </ButtonGroup>
    );
  };

  render() {
    const { type, currentDate, calendarIds } = this.state;
    const {
      queryParams,
      accounts,
      currentUser,
      currentGroup,
      currentBoard,
      boards
    } = this.props;

    const actionBar = (
      <Wrapper.ActionBar
        zIndex={1}
        left={this.renderMonthController()}
        right={this.renderTypeChooser()}
      />
    );

    const mainContent = (
      <Wrapper
        header={<Wrapper.Header title="Calendar" breadcrumb={breadcrumb} />}
        leftSidebar={
          <Sidebar
            dateOnChange={this.dateOnChange}
            currentDate={currentDate}
            {...generateFilters(currentDate, type)}
            onChangeCalendarIds={this.onChangeCalendarIds}
            accounts={accounts}
            currentGroup={currentGroup}
            currentBoard={currentBoard}
            boards={boards}
          />
        }
        actionBar={actionBar}
        content={
          <Event
            {...generateFilters(currentDate, type)}
            type={type}
            currentDate={currentDate}
            calendarIds={calendarIds}
            queryParams={queryParams}
            onDayClick={this.onDayClick}
          />
        }
      />
    );

    return (
      <CalendarContext.Provider
        value={{ accounts, color: this.setColors(), currentUser }}
      >
        {mainContent}
      </CalendarContext.Provider>
    );
  }
}

export default CalendarWrapper;
