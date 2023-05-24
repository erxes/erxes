import { Config, IUser } from '../../types';
import { Label, ListBody, ListHead, ListRow } from '../../styles/tickets';

import Detail from '../containers/Detail';
import EmptyContent from '../../common/EmptyContent';
import React, { useState } from 'react';
import TaskHeader from './TaskHeader';
import { useRouter } from 'next/router';
import { Card } from 'react-bootstrap';
import Group from '../containers/Group';

type Props = {
  loading: boolean;
  tasks: any;
  currentUser: IUser;
  config: Config;
  stages: any;
  pipeLinelabels: any;
  pipelineAssignedUsers: any;
};

const duedateFilter = [
  'noCloseDate',
  'nextMonth',
  'nextWeek',
  'overdue',
  'nextDay'
];
const priorityFilter = ['Critical', 'High', 'Normal', 'Low'];

export default function Task({
  tasks,
  currentUser,
  config,
  stages,
  pipeLinelabels,
  pipelineAssignedUsers
}: Props) {
  const router = useRouter();
  const { itemId } = router.query as { itemId: string };

  const [groupBy, setGroupBy] = useState('normal');

  if (itemId) {
    return (
      <Detail
        _id={itemId}
        onClose={() => router.push('/tasks')}
        currentUser={currentUser}
        config={config}
      />
    );
  }

  const renderContent = () => {
    if (groupBy === 'stage') {
      return (
        <>
          {stages?.stages?.map(d => {
            return (
              <Card key={d._id}>
                <Card.Header>
                  <a>{d?.name}</a>
                </Card.Header>
                <Card.Body>
                  <Group type={'stage'} id={d._id} />
                </Card.Body>
              </Card>
            );
          })}
        </>
      );
    }

    if (groupBy === 'label') {
      return (
        <>
          {pipeLinelabels?.pipelineLabels?.map(d => {
            return (
              <Card key={d._id}>
                <Card.Header>
                  <a>{d?.name}</a>
                </Card.Header>
                <Card.Body>
                  <Group type={'label'} id={d._id} />
                </Card.Body>
              </Card>
            );
          })}
        </>
      );
    }
    if (groupBy === 'duedate') {
      return (
        <>
          {duedateFilter?.map(d => {
            return (
              <Card key={d}>
                <Card.Header>
                  <a>{d}</a>
                </Card.Header>
                <Card.Body>
                  <Group type={'duedate'} id={d} />
                </Card.Body>
              </Card>
            );
          })}
        </>
      );
    }
    if (groupBy === 'priority') {
      return (
        <>
          {priorityFilter?.map(d => {
            return (
              <Card key={d}>
                <Card.Header>
                  <a>{d}</a>
                </Card.Header>
                <Card.Body>
                  <Group type={'priority'} id={d} />
                </Card.Body>
              </Card>
            );
          })}
        </>
      );
    }
    if (groupBy === 'user') {
      return (
        <>
          <TaskHeader
            taskLabel={config.taskLabel || 'Tickets'}
            setGroupBy={setGroupBy}
          />

          {pipelineAssignedUsers.pipelineAssignedUsers?.map(d => {
            return (
              <Card key={d._id}>
                <Card.Header>
                  <a>{d?.details?.fullName}</a>
                </Card.Header>
                <Card.Body>
                  <Group type={'user'} id={d._id} />
                </Card.Body>
              </Card>
            );
          })}
        </>
      );
    }

    return (
      <Card>
        <Card.Body>
          <Group type={'all'} id={''} tasks={tasks} />
        </Card.Body>
      </Card>
    );
  };

  if (itemId) {
    return (
      <Detail
        _id={itemId}
        onClose={() => router.push('/tasks')}
        currentUser={currentUser}
        config={config}
      />
    );
  }

  return (
    <>
      <TaskHeader
        taskLabel={config.ticketLabel || 'Tasks'}
        setGroupBy={setGroupBy}
      />
      <>{renderContent()}</>
    </>
  );
}
