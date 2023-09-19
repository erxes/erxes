import React from 'react';
import {
  Box,
  EmptyState,
  Icon,
  ModalTrigger,
  SectionBodyItem,
  SidebarList
} from '@erxes/ui/src';
import _loadash from 'lodash';
import { IMeeting } from '../../types';
import Form from '../../containers/myCalendar/meeting/Form';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';

type Props = {
  meetings: IMeeting[];
  dealId: string;
};

const meetingDealList = (props: Props) => {
  const history = useHistory();

  const ListItem = meeting => {
    const startTime =
      meeting.startDate && dayjs(meeting.startDate).format('HH:mm');
    const endTime = meeting.endDate && dayjs(meeting.endDate).format('HH:mm');

    const link = `/meetings/myCalendar?meetingId=` + meeting._id;

    return (
      <a href={link}>
        <div
          style={{
            margin: '4px'
          }}
        >
          <h5 style={{ margin: 0 }}>
            {meeting.title}
            {'    '}
            {startTime && endTime && (
              <span>
                {startTime} - {endTime}
              </span>
            )}
          </h5>
        </div>
      </a>
    );
  };

  const renderContent = () => {
    const { meetings } = props;

    if (!meetings?.length) {
      return <EmptyState text="There has no meeting" icon="list-ul" />;
    }

    return (
      <SidebarList noTextColor noBackground id="SideBar">
        {meetings.map(meeting => (
          <SectionBodyItem key={meeting._id}>
            {ListItem(meeting)}
          </SectionBodyItem>
        ))}
      </SidebarList>
    );
  };

  const renderMeetingForm = () => {
    const { meetings, dealId } = props;

    const trigger = (
      <button>
        <Icon icon={'plus-circle'} />
      </button>
    );

    const updatedProps = {
      meetings,
      refetch: ['meetings'],
      dealId
    };

    const content = props => <Form {...props} {...updatedProps} />;

    return (
      <ModalTrigger
        title="Create Meeting"
        trigger={trigger}
        content={content}
        size="lg"
      />
    );
  };

  return (
    <Box
      title="Meeting"
      name="meetingSection"
      isOpen={false}
      extraButtons={renderMeetingForm()}
    >
      {renderContent()}
    </Box>
  );
};

export default meetingDealList;
