import dayjs from 'dayjs';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import React from 'react';
import {
  EventContent,
  EventHeading,
  EventRow,
  EventTitle,
  EventWrapper,
  HeadButton
} from '../styles';
import { IAccount, IEvent } from '../types';
import { milliseconds } from '../utils';
import { CalendarConsumer } from './Wrapper';

type Props = {
  event: IEvent;
  showHour: boolean;
  editEvent: (event: IEvent, account?: IAccount) => void;
  deleteEvent: (_id: string, accountId: string) => void;
  count: number;
  order: number;
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
    const {
      event,
      showHour,
      editEvent,
      deleteEvent,
      color,
      order,
      count
    } = this.props;
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
          <EventHeading>
            <h4>{event.title || ''}</h4>
            <div>
              <HeadButton onClick={edit}>
                <Icon icon="pen-1" />
              </HeadButton>
              <HeadButton onClick={remove}>
                <Icon icon="trash-alt" />
              </HeadButton>
            </div>
          </EventHeading>

          <EventRow>
            <Icon icon="clock-eight" />
            <div>
              {dayjs(startDate).format('dddd, MMMM D , HH:mm')}
              {dayjs(endDate).format(
                isToday ? ' - HH:mma' : ' - MMMM D, HH:mma'
              )}
            </div>
          </EventRow>
          <EventRow>
            <Icon icon="calendar-alt" />
            <div>{event.owner}</div>
          </EventRow>
          <EventRow>
            <Icon icon="users-alt" />
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
          </EventRow>
          {toggle && (
            <EventRow>
              <ul>
                {event.participants.map(p => (
                  <li key={p.email}>{p.name}</li>
                ))}
              </ul>
            </EventRow>
          )}

          {event.description && (
            <EventRow>
              <Icon icon="align-left" />
              <div dangerouslySetInnerHTML={{ __html: event.description }} />
            </EventRow>
          )}
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
      <EventWrapper key={event._id}>
        <ModalTrigger
          title={event.title || ''}
          hideHeader={true}
          centered={true}
          trigger={
            <EventTitle
              {...props}
              order={order}
              count={count || 1}
              color={
                event.color || this.getColor(color, event.providerCalendarId)
              }
            >
              {dayjs(startTime).format('ha')} &nbsp;
              <b>{event.title}</b>
            </EventTitle>
          }
          content={content}
        />
      </EventWrapper>
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
