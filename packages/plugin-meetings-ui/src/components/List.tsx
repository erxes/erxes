import Button from '@erxes/ui/src/components/Button';
import { IMeetings, IType } from '../types';
import Row from './Row';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Form from './Form';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

type Props = {
  meetingss: IMeetings[];
  types: IType[];
  typeId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (meetings: IMeetings) => void;
  edit: (meetings: IMeetings) => void;
  loading: boolean;
};

function List({
  meetingss,
  typeId,
  types,
  remove,
  renderButton,
  loading,
  edit
}: Props) {
  const trigger = (
    <Button id={'AddMeetingsButton'} btnStyle="success" icon="plus-circle">
      Add Meetings
    </Button>
  );

  const modalContent = props => (
    <Form
      {...props}
      types={types}
      renderButton={renderButton}
      meetingss={meetingss}
    />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add meetings')}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__('Meetings')}</Title>;

  const actionBar = (
    <Wrapper.ActionBar left={title} right={actionBarRight} wideSpacing />
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Todo')}</th>
          <th>{__('Expiry Date')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'MeetingssShowing'}>
        {meetingss.map(meetings => {
          return (
            <Row
              space={0}
              key={meetings._id}
              meetings={meetings}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              meetingss={meetingss}
              types={types}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(
      /* webpackChunkName: "List - Meetingss" */ '../containers/SideBarList'
    )
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Meetingss'), link: '/meetingss' }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Meetingss')} breadcrumb={breadcrumb} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={meetingss.length}
          emptyText={__('Theres no meetings')}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={<SideBarList currentTypeId={typeId} />}
      transparent={true}
      hasBorder
    />
  );
}

export default List;
