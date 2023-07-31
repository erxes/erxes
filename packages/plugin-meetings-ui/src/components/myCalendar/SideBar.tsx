import { __ } from '@erxes/ui/src/utils/core';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { IMeeting } from '../../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { Header, SidebarListItem } from '@erxes/ui-settings/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import * as moment from 'moment';
import FormControl from '@erxes/ui/src/components/form/Control';
import { ChatListSearch } from '../../styles';
import dayjs from 'dayjs';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
  afterSave?: () => void;
  meetings: IMeeting[];
  queryParams: any;
};

type State = {
  searchValue: string;
  filteredMeeting: IMeeting[];
};

class SideBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      searchValue: '',
      filteredMeeting: []
    };
  }

  ListItem = meeting => {
    const { queryParams } = this.props;
    const { meetingId } = queryParams;
    const className = meeting && meetingId === meeting._id ? 'active' : '';
    const startTime =
      meeting.startDate && dayjs(meeting.startDate).format('HH:mm');
    const endTime = meeting.endDate && dayjs(meeting.endDate).format('HH:mm');

    return (
      <SidebarListItem isActive={className === 'active'} key={meeting._id}>
        <Link to={`/meetings/myCalendar?meetingId=${meeting._id}`}>
          <div>{__(meeting.title)}</div>
          {startTime && endTime && (
            <div>
              {startTime} - {endTime}
            </div>
          )}
        </Link>
      </SidebarListItem>
    );
  };

  todayMeetings = meetings => {
    const today = moment(); // Get today's date
    const todayMeetings = meetings.filter(meeting => {
      const meetingDate = moment(meeting.startDate);
      return meetingDate.isSame(today, 'day');
    });

    return todayMeetings;
  };

  tommorowMeetings = meetings => {
    const tomorrow = moment().add(1, 'day'); // Get tomorrow's date
    return meetings.filter(meeting => {
      const meetingDate = moment(meeting.startDate);
      return meetingDate.isSame(tomorrow, 'day');
    });
  };

  otherMeetings = meetings => {
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

  handleSearch = (event: any) => {
    const { meetings } = this.props;

    this.setState({ searchValue: event.target.value });
    this.setState({
      filteredMeeting: meetings.filter(item => {
        let name = '';
        return name
          .toLowerCase()
          .includes(this.state.searchValue.toLowerCase());
      })
    });
  };

  render() {
    const { meetings } = this.props;

    return (
      <LeftSidebar>
        <ChatListSearch>
          <FormControl
            type="text"
            placeholder="Search Meeting"
            round={true}
            onChange={this.handleSearch}
          />
        </ChatListSearch>
        {this.todayMeetings(meetings).length > 0 ? (
          <>
            {/* <LeftSidebar.Header uppercase={true}>
              {__('Today meeting')}
            </LeftSidebar.Header> */}
            <h3>{__('Today')}</h3>

            <SidebarList noTextColor noBackground id="SideBar">
              {this.todayMeetings(meetings).map(meeting => {
                return this.ListItem(meeting);
              })}
            </SidebarList>
          </>
        ) : (
          ''
        )}
        {this.tommorowMeetings(meetings).length > 0 ? (
          <>
            <h3>{__('Tommorow')}</h3>

            <SidebarList noTextColor noBackground id="SideBar">
              {this.tommorowMeetings(meetings).map(meeting => {
                return this.ListItem(meeting);
              })}
            </SidebarList>
          </>
        ) : (
          ''
        )}
        {this.otherMeetings(meetings).length > 0 ? (
          <>
            <h3>{__('Other')}</h3>

            <SidebarList noTextColor noBackground id="SideBar">
              {this.otherMeetings(meetings).map(meeting => {
                return this.ListItem(meeting);
              })}
            </SidebarList>
          </>
        ) : (
          ''
        )}
      </LeftSidebar>
    );
  }
}

export default SideBar;
