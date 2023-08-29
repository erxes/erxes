import Button from '@erxes/ui/src/components/Button';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import { MeetingForm } from '../components/myCalendar/meeting/Form';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IMeeting } from '../types';

import { menuMeeting } from '../contants';
import { MyCalendarList } from './myCalendar/MyCalendar';
import SideBar from '../containers/myCalendar/SideBar';

type Props = {
  meetings: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (meetings: IMeeting) => void;
  edit: (meetings: IMeeting) => void;
  loading: boolean;
  searchFilter: string;

  queryParams: any;
  route?: string;
  history: string;
  refetch: any;
};

function List(props: Props) {
  const {
    meetings,
    renderButton,
    loading,
    searchFilter,
    queryParams,
    history,
    refetch
  } = props;

  const [showSideBar, setShowSideBar] = useState<Boolean>(true);
  const [component, setComponent] = useState(<div />);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);

  const { meetingId } = queryParams;
  const routePath = location.pathname.split('/').slice(-1)[0];

  console.log('------====-------', meetings);

  useEffect(() => {
    switch (routePath) {
      case 'myMeeting':
        setComponent(<div>2</div>);
        break;
      case 'agendaTemplate':
        setComponent(<div>1</div>);
        break;
      default:
        setComponent(
          <MyCalendarList {...props} showCreateMeeting={showCreateMeeting} />
        );
    }
  }, [queryParams, meetings]);

  const trigger = (
    <Button
      id={'AddMeetingsButton'}
      btnStyle="success"
      icon="plus-circle"
      onClick={() => setShowCreateMeeting(true)}
    >
      Create new meetings
    </Button>
  );

  const modalContent = props => (
    <MeetingForm
      {...props}
      types={[]}
      renderButton={renderButton}
      meetingDetail={meetings}
    />
  );

  const actionBarRight = (
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
      leftSidebar={
        showSideBar && <SideBar history={history} queryParams={queryParams} />
      }
      transparent={true}
      hasBorder
    />
  );
}

export default List;
