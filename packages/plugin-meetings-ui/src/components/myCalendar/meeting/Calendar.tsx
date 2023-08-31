import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

type Props = {
  events: any[];
};
const localizer = momentLocalizer(moment);

export const CalendarComponent = ({ events }: Props) => {
  const MyCustomEvent = ({ event }: any) => {
    return (
      <div
        style={{
          display: 'grid',
          fontSize: '11px',
          lineHeight: '1.2'
        }}
      >
        <span>{event.title}</span>
        <span>
          {moment(event.start).format('LT') +
            '-' +
            moment(event.end).format('LT')}
        </span>
      </div>
    );
  };

  return (
    <div style={{ height: '80vh' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={['month', 'week', 'day']}
        components={{
          event: MyCustomEvent // Use your custom event component
        }}
        eventPropGetter={event => ({
          style: {
            backgroundColor: event.bgColor,
            margin: '1px 2px',
            width: 'calc(100% - 2px)',
            borderRadius: '6px',
            padding: '2px 8px'
          }
        })}
      />
    </div>
  );
};
