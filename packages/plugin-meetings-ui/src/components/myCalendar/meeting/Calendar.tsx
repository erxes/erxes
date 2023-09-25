import React, { useEffect, useState } from 'react';
import { EventClickArg, formatDate } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { router } from '@erxes/ui/src/utils/core';
import { useHistory } from 'react-router-dom';
import MeetingFormContainer from '../../../containers/myCalendar/meeting/Form';
import { Modal } from 'react-bootstrap';
import { IMeeting } from '../../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { RenderEvent } from '../../../styles';

type Props = {
  meetings?: IMeeting[];
  queryParams: any;
  currentUser: IUser;
  events: any;
  changeDateMeeting: (
    _id: string,
    start: string,
    end: string,
    callback: () => void
  ) => void;
};

function CalendarComponent(props: Props) {
  const {
    events,
    queryParams,
    currentUser,
    meetings,
    changeDateMeeting
  } = props;
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const history = useHistory();

  useEffect(() => {
    setShowModal(false);
  }, [meetings]);

  const handleDateSelect = selectInfo => {
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection
    setStartDate(selectInfo.startStr);
    setEndDate(selectInfo.endStr);
    setShowModal(true);
  };

  const handleEventClick = ({ event }: EventClickArg) => {
    router.setParams(history, { meetingId: event.id });
  };

  const changeEvent = e => {
    const { event, revert } = e;
    const { id, _instance } = event;
    const { range = {} } = _instance;
    const { end, start } = range;

    if (end && start) {
      changeDateMeeting(id, start, end, revert);
    }
  };

  const renderEventContent = ({ event }: EventClickArg) => (
    <RenderEvent backgroundColor={event.backgroundColor}>
      <span style={{ whiteSpace: 'nowrap', paddingLeft: '15px' }}>
        {event.title}
      </span>
      <span
        style={{ whiteSpace: 'nowrap', float: 'right', paddingRight: '15px' }}
      >
        {formatDate(event.startStr!, {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </span>
    </RenderEvent>
  );

  const object = {
    startDate,
    endDate
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        height="80vh"
        initialView="dayGridMonth"
        editable={true}
        selectMirror={true}
        selectable={true}
        dayMaxEvents={true}
        initialEvents={events}
        select={handleDateSelect}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        eventChange={changeEvent}
      />
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton={true}>
          <Modal.Title>Create Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MeetingFormContainer
            queryParams={queryParams}
            refetch={['meetings']}
            currentUser={currentUser}
            closeModal={() => setShowModal(false)}
            calendarDate={object}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default CalendarComponent;
