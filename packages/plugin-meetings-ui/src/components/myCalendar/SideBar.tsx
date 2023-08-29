import { __, router } from '@erxes/ui/src/utils/core';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import React, { useState } from 'react';
import { IMeeting } from '../../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { Header, SidebarListItem } from '@erxes/ui-settings/src/styles';
import * as moment from 'moment';
import FormControl from '@erxes/ui/src/components/form/Control';
import { ChatListSearch } from '../../styles';
import dayjs from 'dayjs';
import { useHistory, Route } from 'react-router-dom';
import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
  afterSave?: () => void;
  meetings: IMeeting[];
  queryParams: any;
};

export const SideBar = (props: Props) => {
  const { queryParams, meetings } = props;
  const { meetingId } = queryParams;
  const [filteredMeeting, setFilteredMeeting] = useState(meetings);
  const [checkBoxValues, setCheckValues] = useState([]);
  const history = useHistory();

  const participantUser = meetings.reduce((uniqueUsers, meeting) => {
    meeting.participantUser.forEach(user => {
      if (!uniqueUsers.some(uniqueUser => uniqueUser._id === user._id)) {
        uniqueUsers.push(user);
      }
    });
    return uniqueUsers;
  }, []);

  const ListItem = meeting => {
    const className = meeting && meetingId === meeting._id ? 'active' : '';
    const startTime =
      meeting.startDate && dayjs(meeting.startDate).format('HH:mm');
    const endTime = meeting.endDate && dayjs(meeting.endDate).format('HH:mm');

    return (
      <SidebarListItem
        isActive={className === 'active'}
        key={meeting._id}
        style={{ borderRadius: '15px', display: 'block' }}
        onClick={() =>
          history.push(`/meetings/myCalendar?meetingId=${meeting._id}`)
        }
      >
        <h5 style={{ margin: '10px 0px 10px 60px' }}>{__(meeting.title)} </h5>
        {startTime && endTime && (
          <h5 style={{ margin: '10px 0px 10px 60px' }}>
            {startTime} - {endTime}
          </h5>
        )}
      </SidebarListItem>
    );
  };

  const todayMeetings = meetings => {
    const today = moment(); // Get today's date
    const todayMeetings = meetings.filter(meeting => {
      const meetingDate = moment(meeting.startDate);
      return meetingDate.isSame(today, 'day');
    });

    return todayMeetings;
  };

  const tommorowMeetings = meetings => {
    const tomorrow = moment().add(1, 'day'); // Get tomorrow's date
    return meetings.filter(meeting => {
      const meetingDate = moment(meeting.startDate);
      return meetingDate.isSame(tomorrow, 'day');
    });
  };

  const otherMeetings = meetings => {
    const today = moment(); // Get today's date
    const tomorrow = moment().add(1, 'day'); // Get tomorrow's date

    return meetings.filter(meeting => {
      const meetingDate = moment(meeting.startDate);
      return (
        !meetingDate.isSame(today, 'day') &&
        !meetingDate.isSame(tomorrow, 'day')
      );
    });
  };

  const handleSearch = (event: any) => {
    setFilteredMeeting(
      meetings.filter(meeting => {
        return meeting.title
          .toLowerCase()
          .includes(event.target.value.toLowerCase());
      })
    );
  };

  const handleChange = (e, userId) => {
    let checkedUsers = checkBoxValues;
    const isChecked = e.target.checked;

    // if selected value is not already in list then add it
    if (isChecked && !checkedUsers.includes(userId)) {
      checkedUsers.push(userId);
    }

    // remove option from checked list
    if (!isChecked) {
      checkedUsers = checkedUsers.filter(v => v !== userId);
    }
    setCheckValues(checkedUsers);
  };

  const data = (
    <SidebarList>
      <h4>{__('Other Calendar')}</h4>
      {participantUser.map(user => {
        return (
          <>
            <FormControl
              componentClass="checkbox"
              onChange={e => handleChange(e, user._id)}
            />
            <FieldStyle>{user.details.fullName}</FieldStyle>
          </>
        );
      })}
    </SidebarList>
  );

  return (
    <LeftSidebar>
      <ChatListSearch>
        <FormControl
          type="text"
          placeholder="Search Meeting"
          round={true}
          onChange={handleSearch}
        />
      </ChatListSearch>
      {todayMeetings(filteredMeeting).length > 0 ? (
        <>
          {/* <LeftSidebar.Header uppercase={true}>
              {__('Today meeting')}
            </LeftSidebar.Header> */}
          <h4>{__('Today')}</h4>

          <SidebarList noTextColor noBackground id="SideBar">
            {todayMeetings(filteredMeeting).map(meeting => {
              return ListItem(meeting);
            })}
          </SidebarList>
        </>
      ) : (
        ''
      )}
      {tommorowMeetings(filteredMeeting).length > 0 ? (
        <>
          <h4>{__('Tommorow')}</h4>

          <SidebarList noTextColor noBackground id="SideBar">
            {tommorowMeetings(filteredMeeting).map(meeting => {
              return ListItem(meeting);
            })}
          </SidebarList>
        </>
      ) : (
        ''
      )}
      {otherMeetings(filteredMeeting).length > 0 ? (
        <>
          <h4>{__('Other')}</h4>

          <SidebarList noTextColor noBackground id="SideBar">
            {otherMeetings(filteredMeeting).map(meeting => {
              return ListItem(meeting);
            })}
          </SidebarList>
        </>
      ) : (
        ''
      )}

      <Box title="" name={`showCaledar`} isOpen={true}>
        <DataWithLoader
          data={data}
          loading={false}
          count={participantUser.length}
          emptyText={'Empty'}
          emptyIcon="leaf"
          size="small"
          objective={true}
        />
      </Box>
    </LeftSidebar>
  );
};

export default SideBar;
