import dayjs from 'dayjs';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import {
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
  RowWrapper,
  HourCol,
  HourRow
} from '../styles';
import { IEvent } from '../types';
import { getDaysInMonth, milliseconds, extractDate } from '../utils';
import AddForm from './AddForm';
import { TYPES, WEEKS } from '../constants';

type Props = {
  currentDate: Date;
  type: string;
  events: IEvent[];
  startTime: Date;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const oneDay = 24 * 60 * 60;
type State = { isPopupVisible: boolean; selectedDate?: Date };

class Event extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isPopupVisible: false,
      selectedDate: new Date()
    };
  }

  onHideModal = (date?: Date) => {
    this.setState({
      isPopupVisible: !this.state.isPopupVisible,
      selectedDate: date
    });
  };

  renderHeader = (startTime?: Date) => {
    const dt = startTime && extractDate(startTime);

    return (
      <Header>
        {WEEKS.map((week, index) => {
          return (
            <ColumnHeader key={week}>
              {week}
              {dt && (
                <>
                  <br />
                  {new Date(dt.year, dt.month, dt.date + index).getDate()}
                </>
              )}
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

    const currentDate = this.props.currentDate;
    const isSelectedDate =
      dayjs(currentDate).diff(day, 'day') === 0 &&
      new Date(currentDate).getDate() === day.getDate();

    return (
      <>
        <Day
          isSelectedDate={isSelectedDate}
          onClick={this.onHideModal.bind(this, day)}
        >
          {day.getDate()}
        </Day>

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
                    <div
                      dangerouslySetInnerHTML={{ __html: event.description }}
                    />
                  </>
                )}
              </EventContent>
            );
          };

          return (
            <EventContainer key={index}>
              <ModalTrigger
                title={event.title || ''}
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

  generateDayData = () => {
    const data: any = [];

    for (let h = 0; h < 24; h++) {
      data.push(
        <DayRow key={h}>
          <span>{h.toString().length === 1 ? `0${h}` : h}</span>
        </DayRow>
      );
    }

    return data;
  };

  generateWeekData = () => {
    const data: any = [];

    for (let h = 0; h < 24; h++) {
      data.push(
        <DayRow key={h}>
          <span>{h.toString().length === 1 ? `0${h}` : h}</span>
          <HourRow>
            {WEEKS.map((week, index) => {
              return <HourCol key={`week_${index}_${h}`}>&nbsp;</HourCol>;
            })}
          </HourRow>
        </DayRow>
      );
    }

    return data;
  };

  render() {
    const { startTime, currentDate, type, renderButton } = this.props;
    const { month, year } = extractDate(currentDate);

    const rows = getDaysInMonth(month, year);

    if (type === TYPES.DAY) {
      return (
        <>
          <DayHeader>{dayjs(currentDate).format('MMM D')}</DayHeader>
          {this.generateDayData()}
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
        </div>
      );
    }

    return (
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
        <AddForm
          isPopupVisible={this.state.isPopupVisible}
          onHideModal={this.onHideModal}
          renderButton={renderButton}
          selectedDate={this.state.selectedDate}
        />
      </CalendarWrapper>
    );
  }
}

export default Event;
