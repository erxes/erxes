import { __ } from '@erxes/ui/src/utils/core';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { colors } from '@erxes/ui/src/styles';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import React, { useState } from 'react';
import { IMeeting } from '../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import * as moment from 'moment';
import FormControl from '@erxes/ui/src/components/form/Control';
import { ChatListSearch } from '../../styles';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';
import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
  afterSave?: () => void;
  meetings: IMeeting[];
  queryParams: any;
  refetch: any;
};

export const SideBar = (props: Props) => {
  const { queryParams, meetings, refetch } = props;
  const { meetingId } = queryParams;
  const [filteredMeeting, setFilteredMeeting] = useState(meetings);
  const [checkBoxValues, setCheckValues] = useState([]);
  const history = useHistory();

  const participantUser = meetings.reduce((uniqueUsers: IUser[], meeting) => {
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
        onClick={() =>
          history.push(`/meetings/myCalendar?meetingId=${meeting._id}`)
        }
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

  const handleChange = (e, userId: string) => {
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
    <SidebarList style={{ padding: '10px 20px' }}>
      {/* <h4>{__("Other Calendar")}</h4> */}
      {participantUser.map((user: any) => {
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px'
            }}
          >
            <FormControl
              componentClass="checkbox"
              onChange={e => handleChange(e, user._id)}
            />
            &emsp;
            <FieldStyle>{user.details.fullName}</FieldStyle>
          </div>
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
      {todayMeetings(filteredMeeting).length > 0 && (
        <Box title="Today" name={`today`} isOpen={true}>
          {/* <h4>{__("Today")}</h4> */}

          <SidebarList noTextColor noBackground id="SideBar">
            {todayMeetings(filteredMeeting).map(meeting => {
              return ListItem(meeting);
            })}
          </SidebarList>
        </Box>
      )}

      {tommorowMeetings(filteredMeeting).length > 0 && (
        <Box title="Tommorow" name={`tomorrow`} isOpen={true}>
          {/* <h4>{__("Tommorow")}</h4> */}

          <SidebarList noTextColor noBackground id="SideBar">
            {tommorowMeetings(filteredMeeting).map(meeting => {
              return ListItem(meeting);
            })}
          </SidebarList>
        </Box>
      )}

      {otherMeetings(filteredMeeting).length > 0 && (
        <Box title="Other" name={`other`} isOpen={false}>
          {/* <h4>{__("Other")}</h4> */}

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
