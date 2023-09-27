import Button from '@erxes/ui/src/components/Button';
import { __, router } from '@erxes/ui/src/utils';
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
  queryParams: any;
  route?: string;
  history: string;
  refetchQueries?: any;
  currentUser: IUser;
  meetingQuery?: MeetingsQueryResponse;
  participantUsers: IUser[];
};

function List(props: Props) {
  const {
    meetings,
    loading,
    queryParams,
    history,
    currentUser,
    meetingQuery,
    participantUsers
  } = props;
  const { meetingId, searchValue } = queryParams;

  const [component, setComponent] = useState(<div />);
  const [leftSideBar, setLeftSideBar] = useState(<div />);

  const [searchText, setSearchValue] = useState(searchValue);

  const routePath = location.pathname.split('/').slice(-1)[0];

  useEffect(() => {
    switch (routePath) {
      case 'myMeetings':
        setComponent(
          <MyMeetingListContainer history={history} queryParams={queryParams} />
        );
        setLeftSideBar(
          <SideBarContainer
            history={history}
            queryParams={queryParams}
            currentUser={currentUser}
          />
        );
        break;
      default:
        setComponent(
          <MyCalendarList
            meetings={meetings}
            queryParams={queryParams}
            meetingQuery={meetingQuery}
            currentUser={currentUser}
          />
        );
        setLeftSideBar(
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

  const searchHandler = e => {
    const searchValue = e.target.value;

    setSearchValue(searchValue);

    setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };
  const backToCalendar = () => {
    router.removeParams(history, 'meetingId');
  };
  const actionBarRight =
    routePath === 'myCalendar' ? (
      meetingId ? (
        <Button
          btnStyle="success"
          size="small"
          icon="calendar-alt"
          onClick={backToCalendar}
        >
          {__('Back to calendar')}
        </Button>
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
        defaultValue={searchText}
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
      header={<Wrapper.Header title={__('Meetings')} submenu={menuMeeting()} />}
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
      leftSidebar={leftSideBar}
      transparent={true}
      hasBorder
    />
  );
}

export default List;
