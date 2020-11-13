import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import Label from 'modules/common/components/form/Label';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { router } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import Select from 'react-select-plus';
import { TYPES } from '../constants';
import EventForm from '../containers/EventForm';
import { CalendarController, SidebarWrapper } from '../styles';
import { ICalendar } from '../types';
import { extractDate } from '../utils';

type Props = {
  dateOnChange: (date: string | Date | undefined) => void;
  currentDate: Date;
  typeOnChange: ({ value, label }: { value: string; label: string }) => void;
  type: string;
  calendars: ICalendar[];
  history: any;
  queryParams: any;
  startTime: Date;
  endTime: Date;
  accountId: string;
};

type State = {
  calendarIds: string[];
  isPopupVisible: boolean;
};

class LeftSidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      calendarIds: [],
      isPopupVisible: false
    };
  }

  onHideModal = () => {
    this.setState({
      isPopupVisible: !this.state.isPopupVisible
    });
  };

  setCalendarIds = () => {
    const { queryParams, calendars, history } = this.props;

    if (!queryParams.calendarIds) {
      const calendarIds = calendars.map(c => c.providerCalendarId);

      this.setState({ calendarIds });
      router.setParams(history, { calendarIds: calendarIds.toString() }, true);
    }
  };

  componentDidUpdate() {
    this.setCalendarIds();
  }

  componentDidMount() {
    const queryParams = this.props.queryParams;

    this.setCalendarIds();

    if (queryParams.calendarIds) {
      this.setState({
        calendarIds: queryParams.calendarIds.split(',')
      });
    }
  }

  renderOptions = (list: string[]) => {
    return list.map(item => ({ value: item, label: item.toUpperCase() }));
  };

  onChange = (increment: boolean) => {
    const { currentDate, type, dateOnChange } = this.props;
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

    dateOnChange(day);
  };

  toggleCheckbox = (calendarId, e: React.FormEvent<HTMLElement>) => {
    const checked = (e.target as HTMLInputElement).checked;
    const calendarIds = this.state.calendarIds;

    if (checked) {
      calendarIds.push(calendarId);
    } else {
      const index = calendarIds.indexOf(calendarId);
      calendarIds.splice(index, 1);
    }

    this.setState({ calendarIds });

    router.setParams(this.props.history, {
      calendarIds: calendarIds.toString()
    });
  };

  render() {
    const {
      type,
      typeOnChange,
      currentDate,
      dateOnChange,
      calendars
    } = this.props;
    const { calendarIds } = this.state;

    return (
      <Sidebar>
        <SidebarWrapper>
          <FormGroup>
            <CalendarController>
              <Icon
                icon="angle-left"
                onClick={this.onChange.bind(this, false)}
              />
              <Icon
                icon="angle-right"
                onClick={this.onChange.bind(this, true)}
              />
              <Label uppercase={true}>
                {dayjs(currentDate).format('MMMM, YYYY')}
              </Label>
            </CalendarController>
          </FormGroup>

          <FormGroup>
            <Select
              isRequired={true}
              value={type}
              onChange={typeOnChange}
              options={this.renderOptions(TYPES.all)}
              clearable={false}
            />
          </FormGroup>

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

          <FormGroup>
            <ControlLabel>Calendars</ControlLabel>
            <br />
            <br />

            {calendars.map(calendar => {
              const calendarId = calendar.providerCalendarId;

              return (
                <div key={calendar._id}>
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
            })}
          </FormGroup>

          <FormGroup>
            <Button
              size="small"
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
        </SidebarWrapper>
      </Sidebar>
    );
  }
}

export default LeftSidebar;
