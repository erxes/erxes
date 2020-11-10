import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import React from 'react';
import { EventContainer, EventContent, EventTitle } from '../styles';
import { IEvent } from '../types';
import { milliseconds } from '../utils';

type Props = {
  event: IEvent;
  showHour: boolean;
  editEvent: (event: IEvent) => void;
  deleteEvent: (event: IEvent) => void;
};

class Detail extends React.Component<Props> {
  render() {
    const { event, showHour, editEvent, deleteEvent } = this.props;
    const startTime = milliseconds(event.when.start_time);
    const endTime = milliseconds(event.when.end_time);

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const content = ({ closeModal }) => {
      const isToday = startDate.toDateString() === endDate.toDateString();

      const edit = () => {
        closeModal();
        editEvent(event);
      };

      const remove = () => {
        closeModal();
        deleteEvent(event);
      };

      return (
        <EventContent>
          <Icon icon="clock" />
          <div>
            {dayjs(startDate).format('dddd, MMMM D , HH:mm')}
            {dayjs(endDate).format(isToday ? ' - HH:mma' : ' - MMMM D, HH:mma')}
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
              <div dangerouslySetInnerHTML={{ __html: event.description }} />
            </>
          )}

          <br />
          <Button btnStyle="warning" size="small" onClick={edit}>
            Edit
          </Button>
          <Button btnStyle="danger" size="small" onClick={remove}>
            Delete
          </Button>
        </EventContent>
      );
    };

    const props: { start?: number; height?: number } = {};
    const calculate = (date: Date) => {
      return date.getHours() + date.getMinutes() / 60;
    };

    if (showHour) {
      props.start = calculate(startDate);
      props.height = calculate(endDate) - props.start;
    }

    return (
      <EventContainer key={event._id}>
        <ModalTrigger
          title={event.title || ''}
          trigger={
            <EventTitle {...props}>
              <Icon icon="check-circle" />
              {dayjs(startTime).format('ha')} &nbsp;
              <b>{event.title}</b>
            </EventTitle>
          }
          content={content}
        />
      </EventContainer>
    );
  }
}

export default Detail;
