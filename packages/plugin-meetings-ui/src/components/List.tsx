import Button from '@erxes/ui/src/components/Button';
import { __, router } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import MeetingFormContainer from '../containers/myCalendar/meeting/Form';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';

import { menuMeeting } from '../contants';
import { MyCalendarList } from './myCalendar/MyCalendar';
import SideBar from '../containers/myCalendar/SideBar';
import { IUser } from '@erxes/ui/src/auth/types';
import { MeetingsQueryResponse } from '../types';
import MyMeetings from './myMeetings/MyMeetings';

type Props = {
  meetings: any;
  loading: boolean;
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
    queryParams,
    history,
    currentUser,
    meetingQuery
  } = props;
  const { meetingId } = queryParams;

  const [component, setComponent] = useState(<div />);
  const [leftSideBar, setLeftSideBar] = useState(<div />);

  const routePath = location.pathname.split('/').slice(-1)[0];

  useEffect(() => {
    switch (routePath) {
      case 'myMeetings':
        <MyMeetings {...props} />;
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
            currentUser={currentUser}
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

  const backToCalendar = () => {
    router.removeParams(history, 'meetingId');
  };
  const actionBarRight = meetingId ? (
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
