import { __, router } from '@erxes/ui/src/utils/core';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { colors } from '@erxes/ui/src/styles';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import React, { useState, useEffect } from 'react';
import { IMeeting } from '../../types';
import { IUser, IUserConversation } from '@erxes/ui/src/auth/types';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import * as moment from 'moment';
import FormControl from '@erxes/ui/src/components/form/Control';
import { ChatListSearch, ParticipantList } from '../../styles';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';
import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { generateColorCode } from '../../utils';

type Props = {
  closeModal?: () => void;
  afterSave?: () => void;
  meetings: IMeeting[];
  queryParams: any;
  loading: boolean;
  participantUsers: IUser[];
};

export const SideBar = (props: Props) => {
  const { queryParams, meetings, loading, participantUsers } = props;
  const { meetingId } = queryParams;
  const [filteredMeeting, setFilteredMeeting] = useState(meetings);
  const [checkedUsers, setCheckedUsers] = useState(
    queryParams.participantUserIds
      ? queryParams.participantUserIds.split(',')
      : []
  );
  const history = useHistory();

  useEffect(() => {
    setFilteredMeeting(meetings);
  }, [meetings, meetings.length]);

  const onClick = (meetingId: string) => {
    router.setParams(history, { meetingId: meetingId });
  };

  const ListItem = meeting => {
    const className = meeting && meetingId === meeting._id ? 'active' : '';
    const startTime =
      meeting.startDate && dayjs(meeting.startDate).format('HH:mm');
    const endTime = meeting.endDate && dayjs(meeting.endDate).format('HH:mm');

    return (
      <SidebarListItem
        isActive={className === 'active'}
        key={meeting._id}
        onClick={() => onClick(meeting._id)}
        backgroundColor="#f2f2f2"
        style={{
          margin: '0 20px 4px 20px',
          borderRadius: '10px',
          padding: '4px 8px'
        }}
      >
        <div
          style={{
            margin: '4px',
            display: 'grid',
            color:
              className === 'active' ? colors.colorPrimary : colors.textPrimary
          }}
        >
          <h5 style={{ margin: 0 }}>{__(meeting.title)}</h5>
          {startTime && endTime && (
            <span>
              {startTime} - {endTime}
            </span>
          )}
        </div>
      </SidebarListItem>
    );
  };

  const todayMeetings = meetings => {
    const today = moment(); // Get today's date
    const todayMeetings = meetings.filter(meeting => {
      const meetingDate = moment(meeting.startDate);
      return meeting.status !== 'completed' && meetingDate.isSame(today, 'day');
    });

    return todayMeetings;
  };

  const tommorowMeetings = meetings => {
    const tomorrow = moment().add(1, 'day'); // Get tomorrow's date
    return meetings.filter(meeting => {
      const meetingDate = moment(meeting.startDate);
      return (
        meeting.status !== 'completed' && meetingDate.isSame(tomorrow, 'day')
      );
    });
  };

  const otherMeetings = meetings => {
    const today = moment(); // Get today's date
    const tomorrow = moment().add(1, 'day'); // Get tomorrow's date

    return meetings.filter(meeting => {
      const meetingDate = moment(meeting.startDate);
      return (
        meeting.status !== 'completed' &&
        !meetingDate.isSame(today, 'day') &&
        meetingDate.isAfter(today) &&
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

  const handleChange = (e, userId: string) => {
    router.removeParams(history, meetingId);
    const isChecked = e.target.checked;
    if (isChecked && !checkedUsers.includes(userId)) {
      setCheckedUsers([...checkedUsers, userId]);
      const participantIds = [...checkedUsers, userId];
      const queryString = 'participantUserIds=' + participantIds.join(',');

      return history.push(`${window.location.pathname}?${queryString}`);
    } else {
      const uncheckedUser = checkedUsers.filter(user => user !== userId);
      setCheckedUsers(uncheckedUser);
      const queryString = 'participantUserIds=' + uncheckedUser.join(',');

      return history.push(`${window.location.pathname}?${queryString}`);
    }
  };

  const data = (
    <SidebarList style={{ padding: '10px 20px' }}>
      {participantUsers.map((user: any) => {
        return (
          <ParticipantList key={user._id}>
            <FormControl
              componentClass="checkbox"
              onChange={e => handleChange(e, user._id)}
              defaultChecked={checkedUsers.includes(user._id)}
            />
            &emsp;
            <FieldStyle>
              {user.details?.fullName !== ' ' && user.details?.fullName !== ''
                ? user.details.fullName
                : user.email}
            </FieldStyle>
            <div className="actions">
              <div
                className="badge"
                style={{
                  backgroundColor: generateColorCode(user._id)
                }}
              />
            </div>
          </ParticipantList>
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
      {todayMeetings(filteredMeeting)?.length > 0 && (
        <Box title="Today" name={`today`} isOpen={true}>
          <SidebarList noTextColor noBackground id="SideBar">
            {todayMeetings(filteredMeeting)?.map(meeting => {
              return ListItem(meeting);
            })}
          </SidebarList>
        </Box>
      )}
      {tommorowMeetings(filteredMeeting)?.length > 0 && (
        <Box title="Tommorow" name={`tomorrow`} isOpen={true}>
          <SidebarList noTextColor noBackground id="SideBar">
            {tommorowMeetings(filteredMeeting)?.map(meeting => {
              return ListItem(meeting);
            })}
          </SidebarList>
        </Box>
      )}
      {otherMeetings(filteredMeeting)?.length > 0 && (
        <Box title="Other" name={`other`} isOpen={false}>
          <SidebarList noTextColor noBackground id="SideBar">
            {otherMeetings(filteredMeeting).map(meeting => {
              return ListItem(meeting);
            })}
          </SidebarList>
        </Box>
      )}
      <Box title="Other calendar" name={`showCaledar`} isOpen={true}>
        <DataWithLoader
          data={data}
          loading={loading}
          count={participantUsers?.length}
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
