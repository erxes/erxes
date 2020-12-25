import Icon from 'modules/common/components/Icon';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { TYPES, WEEKS } from '../constants';
import EventForm from '../containers/EventForm';
import {
  AddEventBtn,
  CalendarWrapper,
  Cell,
  ColumnHeader,
  Day,
  DayRow,
  Grid,
  Header,
  Indicator,
  PopoverCell,
  Presentation,
  Row,
  RowWrapper,
  SeeAll,
  WeekCol,
  WeekContainer,
  WeekData,
  WeekHours,
  WeekWrapper
} from '../styles';
import { IAccount, IEvent } from '../types';
import {
  calcRowCount,
  extractDate,
  filterEvents,
  getDaysInMonth,
  isCurrentDate,
  isSameMonth,
  milliseconds,
  timeConvert
} from '../utils';
import Detail from './Detail';

type Props = {
  currentDate: Date;
  type: string;
  events: IEvent[];
  startTime: Date;
  endTime: Date;
  queryParams: any;
  remove: (_id: string, accountId: string) => void;
  onDayClick: (date) => void;
};

type State = {
  isPopupVisible: boolean;
  selectedDate?: Date;
  event?: IEvent;
  account?: IAccount;
  cellHeight: number;
};

class Event extends React.Component<Props, State> {
  private ref;
  private overlayTrigger;
  private timeout;

  constructor(props) {
    super(props);

    this.ref = React.createRef();

    this.state = {
      isPopupVisible: false,
      selectedDate: new Date(),
      cellHeight: 0
    };
  }

  updateCellHeight = () => {
    this.setState({ cellHeight: this.ref.current.clientHeight });
  };

  handleResize = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.updateCellHeight();
    }, 1000);
  };

  componentDidMount() {
    if (this.props.type === TYPES.MONTH) {
      this.updateCellHeight();
      window.addEventListener('resize', this.handleResize);
    }
  }

  componentWillUnmount() {
    if (this.props.type === TYPES.MONTH) {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  getElapsedHours = () => {
    return new Date().getHours() + new Date().getMinutes() / 60;
  };

  onToggleModal = (date?: Date) => {
    this.setState({
      isPopupVisible: !this.state.isPopupVisible,
      selectedDate: date,
      event: {} as IEvent,
      account: {} as IAccount
    });
  };

  editEvent = (event: IEvent, account?: IAccount) => {
    this.setState({ event, account, isPopupVisible: true });
    // this.onClosePopover();
  };

  deleteEvent = (_id: string, accountId: string) => {
    this.props.remove(_id, accountId);
  };

  renderHeader = (startTime?: Date) => {
    const dt = startTime && extractDate(startTime);

    return (
      <Header>
        {WEEKS.map((week, index) => {
          return (
            <ColumnHeader
              key={week}
              isWeek={dt ? true : false}
              isCurrent={
                dt &&
                isCurrentDate(
                  new Date(dt.year, dt.month, dt.date + index),
                  new Date()
                )
              }
            >
              {week}
              {dt && (
                <strong>
                  {new Date(dt.year, dt.month, dt.date + index).getDate()}
                </strong>
              )}
            </ColumnHeader>
          );
        })}
      </Header>
    );
  };

  renderEvents = (events: IEvent[], showHour: boolean) => {
    let counts;
    let tempCounts;
    let order = 0;
    const calculate = (date: Date) => {
      return date.getHours() + date.getMinutes() / 60;
    };

    const calculateStartTime = startTime => {
      const st = milliseconds(startTime);
      const sd = new Date(st);
      const start = calculate(sd);
      return Math.trunc(start);
    };

    if (showHour) {
      counts = {};

      events.forEach(event => {
        const el = calculateStartTime(event.when.start_time);
        counts[el] = (counts[el] || 0) + 1;
      });

      tempCounts = { ...counts };
    }

    return events.map((event, index) => {
      const el = calculateStartTime(event.when.start_time);

      if (showHour) {
        if (tempCounts[el] === 1) {
          order = 0;
        } else {
          order = tempCounts[el] - 1;
          tempCounts[el] = order;
        }
      }

      return (
        <Detail
          key={event._id}
          event={event}
          showHour={showHour}
          editEvent={this.editEvent}
          deleteEvent={this.deleteEvent}
          count={counts ? counts[el] : 1}
          order={order}
        />
      );
    });
  };

  addEventBtn = (day: Date) => {
    return <AddEventBtn onClick={this.onToggleModal.bind(this, day)} />;
  };

  onClosePopover = () => {
    if (this.overlayTrigger) {
      this.overlayTrigger.hide();
    }
  };

  seeAllEvents = (events, day) => {
    const { cellHeight } = this.state;
    // 24 row height
    if (cellHeight - 24 > events.length * 24) {
      return null;
    }

    const rowCount = calcRowCount(cellHeight, 24);

    if (rowCount > 1) {
      const content = (
        <Popover id="calendar-popover">
          <PopoverCell>
            <Icon icon="times" onClick={this.onClosePopover} size={18} />
            <h5>{day.getDate()}</h5>
            {this.renderEvents(events, false)}
          </PopoverCell>
        </Popover>
      );

      return (
        <OverlayTrigger
          ref={overlayTrigger => {
            this.overlayTrigger = overlayTrigger;
          }}
          trigger="click"
          placement="auto"
          rootClose={false}
          overlay={content}
        >
          <SeeAll>{events.length - (rowCount - 1)} more</SeeAll>
        </OverlayTrigger>
      );
    }

    return null;
  };

  renderContent = (day: Date) => {
    const events = filterEvents(this.props.events, day);
    const rowCount = calcRowCount(this.state.cellHeight, 24);
    let filteredEvents = events;

    if (rowCount > 1 && rowCount < events.length) {
      filteredEvents = events.slice(0, rowCount - 1);
    }

    return (
      <>
        <Day
          isSelectedDate={isCurrentDate(day, this.props.currentDate)}
          isSameMonth={isSameMonth(day, this.props.currentDate)}
          onClick={this.props.onDayClick.bind(this, day)}
        >
          {day.getDate()}
        </Day>
        {this.addEventBtn(day)}
        {this.renderEvents(filteredEvents, false)}
        {this.seeAllEvents(events, day)}
      </>
    );
  };

  generateDayData = () => {
    const { currentDate } = this.props;
    const events = filterEvents(this.props.events, currentDate);

    const renderRows = (isHour?: boolean) => {
      const data: any = [];

      for (let h = 0; h < 24; h++) {
        data.push(
          <WeekData key={isHour ? h : `data-${h}`}>
            {isHour ? timeConvert(h) : this.addEventBtn(currentDate)}
          </WeekData>
        );
      }

      return data;
    };

    return (
      <WeekContainer>
        <WeekHours>{renderRows(true)}</WeekHours>
        <WeekWrapper>
          <WeekCol>
            {renderRows()}
            {this.renderEvents(events, true)}

            {isCurrentDate(currentDate, new Date()) && (
              <Indicator hour={this.getElapsedHours()} />
            )}
          </WeekCol>
        </WeekWrapper>
      </WeekContainer>
    );
  };

  generateWeekData = () => {
    const renderData = (day?: Date, week?: string) => {
      const data: any = [];

      if (day && week) {
        for (let h = 0; h < 24; h++) {
          data.push(
            <WeekData key={`${week}-${day.toDateString()}-${h}`}>
              {this.addEventBtn(day)}
            </WeekData>
          );
        }
      } else {
        for (let h = 0; h < 24; h++) {
          data.push(<WeekData key={h}>{timeConvert(h)}</WeekData>);
        }
      }

      return data;
    };

    const { year, month, date } = extractDate(this.props.startTime);

    return (
      <WeekContainer>
        <WeekHours>{renderData()}</WeekHours>

        <WeekWrapper>
          {WEEKS.map((week, index) => {
            const day = new Date(year, month, date + index);
            const events = filterEvents(this.props.events, day);
            const isCurrentWeek = isCurrentDate(day, new Date());

            return (
              <WeekCol isCurrent={isCurrentWeek} key={`week_${index}`}>
                {renderData(day, week)}
                {this.renderEvents(events, true)}
                {isCurrentWeek && <Indicator hour={this.getElapsedHours()} />}
              </WeekCol>
            );
          })}
        </WeekWrapper>
      </WeekContainer>
    );
  };

  render() {
    const { startTime, endTime, currentDate, type } = this.props;
    const { isPopupVisible, selectedDate, event, account } = this.state;

    const createForm = (
      <EventForm
        startTime={startTime}
        endTime={endTime}
        isPopupVisible={isPopupVisible}
        onHideModal={this.onToggleModal}
        selectedDate={selectedDate}
        event={event}
        account={account}
      />
    );

    if (type === TYPES.DAY) {
      return (
        <>
          {this.generateDayData()}
          {createForm}
        </>
      );
    }

    if (type === TYPES.WEEK) {
      return (
        <div>
          <DayRow>
            <span>&nbsp;</span>
            {this.renderHeader(startTime)}
          </DayRow>
          {this.generateWeekData()}
          {createForm}
        </div>
      );
    }

    const { month, year } = extractDate(currentDate);
    const rows = getDaysInMonth(month, year);

    return (
      <CalendarWrapper>
        <Grid>
          {this.renderHeader()}
          <Presentation>
            {rows.map((days, index) => (
              <Row key={index}>
                <RowWrapper>
                  {days.map((day, dayIndex) => (
                    <Cell
                      isCurrent={isCurrentDate(day, new Date())}
                      key={dayIndex}
                      innerRef={this.ref}
                    >
                      {this.renderContent(day)}
                    </Cell>
                  ))}
                </RowWrapper>
              </Row>
            ))}
          </Presentation>
        </Grid>
        {createForm}
      </CalendarWrapper>
    );
  }
}

export default Event;
