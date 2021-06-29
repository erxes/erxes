import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import Sidebar from 'modules/layout/components/Sidebar';
import { IBoard, IGroup } from 'modules/settings/calendars/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { STORAGE_CALENDAR_IDS } from '../constants';
import EventForm from '../containers/EventForm';
import { CalendarItem, CommonWrapper, SidebarHeading } from '../styles';
import { IAccount, INylasCalendar } from '../types';
import BoardChooser from './BoardChooser';

type Props = {
  dateOnChange: (date: string | Date | undefined) => void;
  currentDate: Date;
  onChangeCalendarIds: (ids: string[]) => void;
  startTime: Date;
  endTime: Date;
  accounts: IAccount[];
  currentGroup: IGroup;
  currentBoard?: IBoard;
  boards: IBoard[];
};

type State = {
  isPopupVisible: boolean;
  calendarIds: string[];
};

class LeftSidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isPopupVisible: false,
      calendarIds: this.getCalendarIds(props.accounts)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.accounts !== this.props.accounts) {
      const calendarIds = this.getCalendarIds(nextProps.accounts);

      this.setState({ calendarIds });
      this.props.onChangeCalendarIds(calendarIds);
    }
  }

  componentDidMount() {
    const { calendarIds } = this.state;

    if (calendarIds.length !== 0) {
      this.props.onChangeCalendarIds(calendarIds);
    }
  }

  getCalendarIds(accounts: IAccount[]) {
    const calendarIds: string[] = [];
    const storedCalendarIds = localStorage.getItem(STORAGE_CALENDAR_IDS);

    if (storedCalendarIds) {
      return JSON.parse(storedCalendarIds);
    }

    accounts.map(acc => {
      calendarIds.push(acc._id);

      return acc.calendars
        .filter(c => !c.readOnly)
        .map(cal => calendarIds.push(cal.providerCalendarId));
    });

    localStorage.setItem(STORAGE_CALENDAR_IDS, JSON.stringify(calendarIds));

    return calendarIds;
  }

  onHideModal = () => {
    this.setState({
      isPopupVisible: !this.state.isPopupVisible
    });
  };

  toggleCheckbox = (calendarId, e: React.FormEvent<HTMLElement>) => {
    const checked = (e.target as HTMLInputElement).checked;
    const calendarIds = this.state.calendarIds;

    if (checked) {
      calendarIds.push(calendarId);
    } else {
      const index = calendarIds.indexOf(calendarId);

      if (index >= 0) {
        calendarIds.splice(index, 1);
      }
    }

    this.setState({ calendarIds });
    localStorage.setItem(STORAGE_CALENDAR_IDS, JSON.stringify(calendarIds));

    this.props.onChangeCalendarIds(calendarIds);
  };

  toggleAccountCheckbox = (
    account: IAccount,
    e: React.FormEvent<HTMLElement>
  ) => {
    const checked = (e.target as HTMLInputElement).checked;
    let calendarIds = this.state.calendarIds || [];
    const providerCalendarIds = account.calendars.map(
      c => c.providerCalendarId
    );

    const ids = [account._id, ...providerCalendarIds];

    if (checked) {
      calendarIds = calendarIds.concat(ids);
    } else {
      ids.map(id => {
        const index = calendarIds.indexOf(id);
        return index >= 0 && calendarIds.splice(index, 1);
      });
    }

    this.setState({ calendarIds });

    this.props.onChangeCalendarIds(calendarIds);
  };

  renderCalendars = (
    calendars: INylasCalendar[],
    color: string,
    calendarCount: number
  ) => {
    const { calendarIds } = this.state;

    return calendars.map(calendar => {
      const calendarId = calendar.providerCalendarId;

      return (
        <CalendarItem key={calendar._id}>
          {calendarCount !== 1 && <>&nbsp; &nbsp; &nbsp;</>}
          <FormControl
            key={calendar._id}
            className="toggle-message"
            componentClass="checkbox"
            onChange={this.toggleCheckbox.bind(this, calendarId)}
            checked={calendarIds.includes(calendarId)}
            color={calendar.color || color}
          >
            {calendar.name}
          </FormControl>
        </CalendarItem>
      );
    });
  };

  renderAccounts = () => {
    const { accounts, currentBoard } = this.props;

    if (accounts.length === 0) {
      return (
        <CommonWrapper>
          <Link
            to={`/settings/calendars?boardId=${
              currentBoard ? currentBoard._id : ''
            }`}
          >
            <Button
              block={true}
              uppercase={false}
              btnStyle="success"
              icon="cog"
            >
              Connect account
            </Button>
          </Link>
        </CommonWrapper>
      );
    }

    return (
      <FormGroup>
        <SidebarHeading>My Calendars</SidebarHeading>
        {this.props.accounts.map(account => {
          const calendarCount = account.calendars.length;
          return (
            <div key={account._id}>
              {calendarCount !== 1 && (
                <CalendarItem>
                  <FormControl
                    className="toggle-message"
                    componentClass="checkbox"
                    onChange={this.toggleAccountCheckbox.bind(this, account)}
                    checked={this.state.calendarIds.includes(account._id)}
                    color={account.color}
                  >
                    {account.name}
                  </FormControl>
                </CalendarItem>
              )}
              {this.renderCalendars(
                account.calendars,
                account.color,
                calendarCount
              )}
            </div>
          );
        })}
      </FormGroup>
    );
  };

  renderSidebarHeader() {
    const disabled = this.props.accounts.length === 0;

    return (
      <CommonWrapper>
        <Button
          uppercase={false}
          btnStyle={!disabled ? 'success' : 'simple'}
          onClick={this.onHideModal}
          block={true}
          icon="plus-circle"
          disabled={disabled}
        >
          Create Event
        </Button>
        <EventForm
          {...this.props}
          isPopupVisible={this.state.isPopupVisible}
          onHideModal={this.onHideModal}
        />
      </CommonWrapper>
    );
  }

  render() {
    const {
      currentDate,
      dateOnChange,
      currentGroup,
      currentBoard,
      boards
    } = this.props;

    if (!currentBoard) {
      return (
        <Sidebar full={true}>
          <EmptyState
            text="There is no connected account"
            image="/images/actions/6.svg"
            size="full"
            extra={
              <Link to="/settings/calendars">
                <Button uppercase={false} btnStyle="success" icon="cog">
                  Create Board & Group
                </Button>
              </Link>
            }
          />
        </Sidebar>
      );
    }

    return (
      <Sidebar full={true} header={this.renderSidebarHeader()}>
        <FormGroup>
          <Datetime
            inputProps={{ placeholder: 'Click to select a date' }}
            dateFormat="YYYY/MM/DD"
            timeFormat="HH:mm"
            closeOnSelect={true}
            utc={true}
            input={false}
            value={currentDate}
            onChange={dateOnChange}
            defaultValue={dayjs()
              .startOf('day')
              .add(12, 'hour')
              .format('YYYY-MM-DD HH:mm:ss')}
          />
        </FormGroup>

        <BoardChooser
          currentGroup={currentGroup}
          currentBoard={currentBoard}
          boards={boards}
        />
        {this.renderAccounts()}
      </Sidebar>
    );
  }
}

export default LeftSidebar;
