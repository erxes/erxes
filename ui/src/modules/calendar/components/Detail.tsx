import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import React from 'react';
import { EventContent, EventTitle } from '../styles';
import { IAccount, IEvent } from '../types';
import { milliseconds } from '../utils';
import { CalendarConsumer } from './Wrapper';

type Props = {
  event: IEvent;
  showHour: boolean;
  editEvent: (event: IEvent, account?: IAccount) => void;
  deleteEvent: (_id: string, accountId: string) => void;
};

type FinalProps = {
  color: object;
  accounts: IAccount[];
} & Props;

class Detail extends React.Component<FinalProps, { toggle: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      toggle: false
    };
  }

  getColor(color: object, accountId: string) {
    const colorCode = color[accountId];

    return colorCode;
  }

  getAccount() {
    const { event, accounts } = this.props;

    for (const account of accounts) {
      const acc = account.calendars.find(
        c => c.providerCalendarId === event.providerCalendarId
      );

      if (acc) {
        return account;
      }
    }

    return;
  }

  onToggle = () => {
    this.setState({ toggle: !this.state.toggle });
  };

  render() {
    const { event, showHour, editEvent, deleteEvent, color } = this.props;
    const startTime = milliseconds(event.when.start_time);
    const endTime = milliseconds(event.when.end_time);

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const content = ({ closeModal }) => {
      const isToday = startDate.toDateString() === endDate.toDateString();

      const edit = () => {
        closeModal();
        editEvent(event, this.getAccount());
      };

      const remove = () => {
        const account = this.getAccount();
        closeModal();

        if (account) {
          deleteEvent(event.providerEventId, account.accountId);
        }
      };

      const { toggle } = this.state;
      const guestCount = event.participants.length;

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
          <div>
            {guestCount} guests &nbsp;
            {guestCount !== 0 && (
              <Icon
                icon={`arrow-${toggle ? 'up' : 'down'}`}
                onClick={this.onToggle}
                style={{ cursor: 'pointer' }}
              />
            )}
          </div>
          {toggle && (
            <ul>
              {event.participants.map(p => (
                <li key={p.email}>{p.name}</li>
              ))}
            </ul>
          )}
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
      <div key={event._id}>
        <ModalTrigger
          title={event.title || ''}
          trigger={
            <EventTitle
              {...props}
              color={this.getColor(color, event.providerCalendarId)}
            >
              {dayjs(startTime).format('ha')} &nbsp;
              <b>{event.title}</b>
            </EventTitle>
          }
          content={content}
        />
      </div>
    );
  }
}

const WithConsumer = (props: Props) => {
  return (
    <CalendarConsumer>
      {({ color, accounts }) => (
        <Detail {...props} color={color} accounts={accounts} />
      )}
    </CalendarConsumer>
  );
};

export default WithConsumer;
