import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import EventForm from '../containers/EventForm';
import { Calendars } from '../styles';
import { IAccount } from '../types';

type Props = {
  dateOnChange: (date: string | Date | undefined) => void;
  currentDate: Date;
  onChangeCalendarIds: (ids: string[]) => void;
  history: any;
  queryParams: any;
  startTime: Date;
  endTime: Date;
  accounts: IAccount[];
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

    accounts.map(acc => {
      calendarIds.push(acc._id);

      return acc.calendars
        .filter(c => !c.readOnly)
        .map(cal => calendarIds.push(cal.providerCalendarId));
    });

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

  renderCalendars = calendars => {
    const { calendarIds } = this.state;

    return calendars.map(calendar => {
      const calendarId = calendar.providerCalendarId;

      return (
        <div key={calendar._id}>
          &nbsp; &nbsp; &nbsp;
          <FormControl
            key={calendar._id}
            className="toggle-message"
            componentClass="checkbox"
            onChange={this.toggleCheckbox.bind(this, calendarId)}
            checked={calendarIds.includes(calendarId)}
          >
            {calendar.name}
          </FormControl>
        </div>
      );
    });
  };

  renderAccounts = () => {
    return (
      <FormGroup>
        <ControlLabel>My Calendars</ControlLabel>
        <br />
        <br />

        {this.props.accounts.map(account => {
          return (
            <div key={account._id}>
              <FormControl
                className="toggle-message"
                componentClass="checkbox"
                onChange={this.toggleAccountCheckbox.bind(this, account)}
                checked={this.state.calendarIds.includes(account._id)}
              >
                <Icon icon={'circle'} style={{ color: account.color }} /> &nbsp;
                {account.name}
              </FormControl>
              {this.renderCalendars(account.calendars)}
              <br />
            </div>
          );
        })}
      </FormGroup>
    );
  };

  render() {
    const { currentDate, dateOnChange } = this.props;

    return (
      <Sidebar full={true}>
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

        <Calendars>
          {this.renderAccounts()}

          <FormGroup>
            <Button
              uppercase={false}
              btnStyle="success"
              onClick={this.onHideModal}
            >
              Create Event
            </Button>
            <EventForm
              {...this.props}
              isPopupVisible={this.state.isPopupVisible}
              onHideModal={this.onHideModal}
            />
          </FormGroup>
        </Calendars>
      </Sidebar>
    );
  }
}

export default LeftSidebar;
