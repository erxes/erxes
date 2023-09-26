import { __, router } from '@erxes/ui/src/utils/core';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { colors } from '@erxes/ui/src/styles';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import React, { useState, useEffect } from 'react';
import { IMeeting } from '../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import * as moment from 'moment';
import {
  FlexColumnCustom,
  MeetingListSearch,
  ParticipantList
} from '../../styles';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';
import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { generateColorCode } from '../../utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { Button, Icon } from '@erxes/ui/src/components';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { SelectTeamMembers, ModalTrigger } from '@erxes/ui/src';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ChooseOwnerFormContainer } from '../../containers/myCalendar/ChooseOwnerForm';

const { Section } = Wrapper.Sidebar;

type Props = {
  closeModal?: () => void;
  afterSave?: () => void;
  meetings: IMeeting[];
  queryParams: any;
  loading: boolean;
  participantUsers: IUser[];
  pinnedUsers: string[];
};

export const SideBar = (props: Props) => {
  const {
    queryParams,
    meetings,
    loading,
    participantUsers,
    pinnedUsers
  } = props;
  const { meetingId, searchUserValue } = queryParams;
  const [filteredMeeting, setFilteredMeeting] = useState(meetings);
  const [searchUser, setSearchValue] = useState(searchUserValue);

  console.log('object');
  const [checkedUsers, setCheckedUsers] = useState(
    queryParams.participantUserIds
      ? queryParams.participantUserIds.split(',')
      : ['hell']
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

  const handleSearch = (event: any) => {
    setFilteredMeeting(
      meetings.filter(meeting => {
        return meeting.title
          .toLowerCase()
          .includes(event.target.value.toLowerCase());
      })
    );
  };
  const handleSearchUser = (e: any) => {
    const searchValue = e.target.value;

    setSearchValue(searchValue);

    setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchUserValue: searchValue });
    }, 500);
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

  const clearUserFilter = () => {
    router.setParams(history, {
      searchUserValue: null
    });
  };

  const data = (
    <SidebarList style={{ padding: '10px 20px' }}>
      <MeetingListSearch>
        <FormControl
          type="text"
          placeholder="Search team member"
          onChange={handleSearchUser}
          defaultValue={searchUser}
        />
      </MeetingListSearch>
      {participantUsers.map((user: any) => {
        return (
          <ParticipantList key={user._id}>
            <FormControl
              componentClass="checkbox"
              onChange={e => handleChange(e, user._id)}
              defaultChecked={checkedUsers.includes(user._id)}
            />
            &emsp;
            <FieldStyle>{user?.details?.fullName || user?.email}</FieldStyle>
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

      <Section.QuickButtons>
        {router.getParam(history, 'searchUserValue') && (
          <Button btnStyle="warning" onClick={clearUserFilter}>
            Clear filter
          </Button>
        )}
      </Section.QuickButtons>
    </SidebarList>
  );

  const emptyContent = () => {
    return (
      <>
        <MeetingListSearch>
          <FormControl
            type="text"
            placeholder="Search team member"
            onChange={handleSearchUser}
            defaultValue={searchUser}
          />
        </MeetingListSearch>
        <Section.QuickButtons>
          {router.getParam(history, 'searchUserValue') && (
            <Button btnStyle="warning" onClick={clearUserFilter}>
              Clear filter
            </Button>
          )}
        </Section.QuickButtons>
      </>
    );
  };

  const renderTeamMemberForm = props => {
    return (
      <Form
        renderContent={() => {
          return (
            <>
              <FormGroup>
                <div style={{ marginBottom: '0' }}>
                  <ControlLabel>Team members </ControlLabel>
                  <div style={{ width: '100%' }}>
                    <SelectTeamMembers
                      initialValue={['']}
                      customField="userIds"
                      filterParams={{}}
                      queryParams={queryParams}
                      label={'Select team member'}
                      onSelect={() => {}}
                      name="userId"
                    />
                  </div>
                </div>
              </FormGroup>
            </>
          );
        }}
        {...props}
      />
    );
  };

  const trigger = (
    <a href="#settings" tabIndex={0}>
      <Icon icon="plus-circle" />
    </a>
  );

  const renderForm = ({ closeModal }) => {
    return (
      <ChooseOwnerFormContainer
        closeModal={closeModal}
        pinnedUserIds={pinnedUsers}
      />
    );
  };

  const extraButtons = (
    <ModalTrigger
      content={({ closeModal }) => renderForm({ closeModal })}
      title={`Add members`}
      trigger={trigger}
    />
  );

  return (
    <LeftSidebar>
      <MeetingListSearch>
        <FormControl
          type="text"
          placeholder="Search Meeting"
          round={true}
          onChange={handleSearch}
        />
      </MeetingListSearch>
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

      <Box
        title="Other calendar"
        name={`showCaledar`}
        isOpen={true}
        extraButtons={extraButtons}
        // collapsible={true}
      >
        <DataWithLoader
          data={data}
          loading={loading}
          count={participantUsers?.length}
          emptyText={'Empty'}
          emptyIcon="leaf"
          emptyContent={
            <FlexColumnCustom marginNum={20}>
              <MeetingListSearch>
                <FormControl
                  type="text"
                  placeholder="Search team member"
                  onChange={handleSearchUser}
                  defaultValue={searchUser}
                />
              </MeetingListSearch>
              <Section.QuickButtons>
                {router.getParam(history, 'searchUserValue') && (
                  <Button btnStyle="warning" onClick={clearUserFilter}>
                    Clear filter
                  </Button>
                )}
              </Section.QuickButtons>
            </FlexColumnCustom>
          }
          size="small"
          objective={true}
        />
      </Box>
    </LeftSidebar>
  );
};

export default SideBar;
