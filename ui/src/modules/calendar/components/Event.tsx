import dayjs from 'dayjs';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import React from 'react';
import {
  CalendarContainer,
  CalendarWrapper,
  Cell,
  ColumnHeader,
  Day,
  DayHeader,
  DayRow,
  EventContainer,
  EventContent,
  EventTitle,
  Grid,
  Header,
  Presentation,
  Row,
  RowWrapper
} from '../styles';
import AddForm from './AddForm';

type Props = {
  currentDate: Date;
  type: string;
  events: any[];
  add: (
    {
      title,
      end,
      start,
      description
    }: { title: string; end: string; start: string; description: string }
  ) => void;
};

const oneDay = 24 * 60 * 60;

class Event extends React.Component<Props, { isPopupVisible: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      isPopupVisible: false
    };
  }

  onHideModal = () => {
    this.setState({ isPopupVisible: !this.state.isPopupVisible });
  };

  getDaysInMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    const rows: Date[][] = [];
    let days: Date[] = [];
    const dayOfWeek = date.getDay();

    if (dayOfWeek !== 0) {
      for (let i = dayOfWeek - 1; i >= 0; i--) {
        days.push(new Date(year, month, i * -1));
      }
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);

      if (date.getDay() === 0) {
        rows.push(days);
        days = [];
      }
    }

    if (days.length !== 0) {
      for (let i = 1; days.length < 7; i++) {
        days.push(new Date(year, month + 1, i));
      }

      rows.push(days);
    }

    return rows;
  };

  renderHeader = () => {
    const weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Header>
        {weeks.map(week => {
          return (
            <ColumnHeader key={week}>
              <span>{week}</span>
            </ColumnHeader>
          );
        })}
      </Header>
    );
  };

  renderContent = (day: Date) => {
    const second = day.getTime() / 1000;
    const events = this.props.events.filter(
      event =>
        event.when &&
        event.when.start_time > second &&
        event.when.end_time < second + oneDay
    );

    const milliseconds = (sec: number) => {
      return sec * 1000;
    };

    return (
      <>
        <Day onClick={this.onHideModal}>{day.getDate()}</Day>

        {events.map((event, index) => {
          const startTime = milliseconds(event.when.start_time);
          const endTime = milliseconds(event.when.end_time);
          const content = () => {
            return (
              <EventContent>
                <Icon icon="clock" />
                <div>
                  {dayjs(startTime).format('dddd, MMMM D  , HH:mm')}
                  {dayjs(endTime).format(' - HH:mma')}
                </div>
                <br />
                <Icon icon="calendar-alt" />
                <div>{event.owner}</div>
                <br />
                <Icon icon="users" />
                <div>{event.participants.length} guests</div>
                {event.description && (
                  <>
                    <br /> <Icon icon="book" />
                  </>
                )}
                <div dangerouslySetInnerHTML={{ __html: event.description }} />
              </EventContent>
            );
          };

          return (
            <EventContainer key={index}>
              <ModalTrigger
                title={event.title}
                trigger={
                  <EventTitle>
                    <Icon icon="check-circle" />
                    {dayjs(startTime).format('ha')} &nbsp;
                    <b>{event.title}</b>
                  </EventTitle>
                }
                content={content}
              />
            </EventContainer>
          );
        })}
      </>
    );
  };

  render() {
    const { currentDate, type } = this.props;

    const rows = this.getDaysInMonth(
      currentDate.getMonth(),
      currentDate.getFullYear()
    );

    const data: any = [];

    for (let i = 0; i < 24; i++) {
      data.push(
        <DayRow key={i}>
          <span>{i.toString().length === 1 ? `0${i}` : i}</span>
        </DayRow>
      );
    }

    if (type === 'day') {
      return (
        <>
          <DayHeader>{dayjs(currentDate).format('MMM D')}</DayHeader>
          {data}
        </>
      );
    }

    if (type === 'week') {
      return (
        <div>
          {this.renderHeader()}
          {data}
        </div>
      );
    }

    return (
      <CalendarContainer>
        <CalendarWrapper>
          <Grid>
            {this.renderHeader()}
            <Presentation>
              {rows.map((days, index) => (
                <Row key={index}>
                  <RowWrapper>
                    {days.map((day, dayIndex) => (
                      <Cell key={dayIndex}>{this.renderContent(day)}</Cell>
                    ))}
                  </RowWrapper>
                </Row>
              ))}
            </Presentation>
          </Grid>
        </CalendarWrapper>
        <AddForm
          isPopupVisible={this.state.isPopupVisible}
          add={this.props.add}
          onHideModal={this.onHideModal}
        />
      </CalendarContainer>
    );
  }
}

export default Event;
