import Button from '@erxes/ui/src/components/Button';
import { Link } from 'react-router-dom';
import { __ } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import MeetingFormContainer from '../containers/myCalendar/meeting/Form';
import MyMeetingListContainer from '../containers/myMeetings/List';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';

import { menuMeeting } from '../contants';
import { MyCalendarList } from './myCalendar/MyCalendar';
import SideBar from '../containers/myCalendar/SideBar';
import SideBarContainer from '../containers/myMeetings/SideBar';
import { IUser } from '@erxes/ui/src/auth/types';
import { FormControl } from '@erxes/ui/src/components';
import { MeetingsQueryResponse } from '../types';

type Props = {
  meetings: any;
  loading: boolean;
  searchFilter: string;
  queryParams: any;
  route?: string;
  history: string;
  refetchQueries?: any;
  currentUser: IUser;
  meetingQuery?: MeetingsQueryResponse;
};

function List(props: Props) {
  const {
    meetings,
    loading,
    searchFilter,
    queryParams,
    history,
    currentUser,
    meetingQuery
  } = props;

  const [component, setComponent] = useState(<div />);
  const [sideBar, setSideBar] = useState(<div />);

  const { meetingId } = queryParams;
  const routePath = location.pathname.split('/').slice(-1)[0];

  useEffect(() => {
    switch (routePath) {
      case 'myMeetings':
        setComponent(
          <MyMeetingListContainer
            history={history}
            queryParams={queryParams}
            meetings={meetings}
          />
        );
        setSideBar(
          <SideBarContainer
            history={history}
            queryParams={queryParams}
            currentUser={currentUser}
          />
        );
        break;
      // case 'agendaTemplate':
      //   setComponent(<div>1</div>);
      //   setSideBar(<div>sidebar 1</div>);
      //   break;
      default:
        setComponent(<MyCalendarList {...props} />);
        setSideBar(
          <SideBar
            history={history}
            queryParams={queryParams}
            meetings={meetings}
            loading={loading}
          />
        );
        break;
    }
  }, [queryParams, meetings]);

  const trigger = (
    <Button
      id={'AddMeetingsButton'}
      btnStyle="success"
      icon="plus-circle"
      onClick={() => {}}
    >
      Create new meetings
    </Button>
  );

  const modalContent = props => (
    <MeetingFormContainer
      queryParams={queryParams}
      refetch={meetingQuery?.refetch}
      currentUser={currentUser}
      closeModal={props.closeModal}
      object={null}
    />
  );

  const searchHandler = event => {};
  const actionBarRight =
    routePath === 'myCalendar' ? (
      meetingId ? (
        <Link to="/meetings/myCalendar">
          <Button btnStyle="success" size="small" icon="calendar-alt">
            {__('Back to calendar')}
          </Button>
        </Link>
      ) : (
        <ModalTrigger
          title={__('Create meetings')}
          trigger={trigger}
          content={modalContent}
          enforceFocus={false}
          size="xl"
        />
      )
    ) : (
      <FormControl
        type="text"
        placeholder={__('Type to search')}
        onChange={searchHandler}
        autoFocus={true}
      />
    );

  const title = !meetingId && (
    <Title capitalize={true}>{__('My Calendar')}</Title>
  );

  const actionBar = (
    <Wrapper.ActionBar left={title} right={actionBarRight} wideSpacing />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Meetings')}
          submenu={menuMeeting(searchFilter)}
        />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={component}
          loading={loading}
          count={1}
          emptyText={__('Theres no meetings')}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={sideBar}
      transparent={true}
      hasBorder
    />
  );
}

export default List;
