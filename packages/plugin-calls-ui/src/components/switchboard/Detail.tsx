import React from 'react';
import { Table } from '@erxes/ui/src/components';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { Row } from './Row';
import { dimensions } from '@erxes/ui/src/styles';
import { IQueueDoc, IWaitingCall } from '../../types';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import {
  DashboardTable,
  GridContainer,
  GridItem,
  Header,
  Item3,
  Label,
  Td,
  Th,
} from '../../styles';
import { formatTime } from '../../utils';

type IProps = {
  waitingList: IWaitingCall | string;
  proceedingList: IWaitingCall | string;
  memberList: IQueueDoc;
  initialTalkingCall: any;
  initialWaitingCall: any;
};

function Detail(props: IProps) {
  const {
    waitingList,
    proceedingList,
    memberList,
    initialTalkingCall,
    initialWaitingCall,
  } = props;

  const formatName = (firstName, lastName) => {
    const lastInitial = lastName?.charAt(0).toUpperCase();
    return `${lastInitial}.${firstName}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.slice(5, 16);
  };

  const renderTable = (list, isWaitinglist) => {
    return (
      <DashboardTable color={isWaitinglist ? '#dc9012e8' : '#46a621d9'}>
        <Table>
          <thead>
            <tr>
              <Th backgroundColor={isWaitinglist ? '#dc9012e8' : '#46a621d9'}>
                {'Status'}
              </Th>
              <Th backgroundColor={isWaitinglist ? '#dc9012e8' : '#46a621d9'}>
                {'Caller'}
              </Th>
              {!isWaitinglist && (
                <Th backgroundColor={isWaitinglist ? '#dc9012e8' : '#46a621d9'}>
                  {'Callee'}
                </Th>
              )}
              <Th backgroundColor={isWaitinglist ? '#dc9012e8' : '#46a621d9'}>
                {isWaitinglist ? 'Wait time' : 'Talk time'}
              </Th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td
                  colSpan={isWaitinglist ? 4 : 5}
                  style={{ textAlign: 'center' }}
                >
                  <EmptyState icon="postcard" text="No data" size="large" />
                </td>
              </tr>
            ) : (
              list?.map((data, index: number) => (
                <Row callList={data} key={index} isWaiting={isWaitinglist} />
              ))
            )}
          </tbody>
        </Table>
      </DashboardTable>
    );
  };
  const waitingDetail = () => {
    let members =
      typeof waitingList === 'string'
        ? JSON.parse(waitingList).member
        : waitingList?.member;
    let initialMembers =
      typeof initialWaitingCall === 'string'
        ? JSON.parse(initialWaitingCall).member
        : initialWaitingCall?.member || [];
    return (
      <GridItem>
        <>
          <Header>Waiting</Header>
          <DataWithLoader
            data={renderTable(members || initialMembers, true)}
            loading={false}
            count={1}
            emptyText={'There are no waiting calls'}
            emptyImage="/images/actions/18.svg"
          />
        </>
      </GridItem>
    );
  };

  const proceedingDetail = () => {
    const members =
      typeof proceedingList === 'string'
        ? JSON.parse(proceedingList).member
        : proceedingList?.member;
    let initialMembers =
      typeof initialTalkingCall === 'string'
        ? JSON.parse(initialTalkingCall).member
        : initialTalkingCall?.member || [];

    return (
      <GridItem>
        <Header>Talking</Header>
        <DataWithLoader
          data={renderTable(members || initialMembers, false)}
          loading={false}
          count={1}
          emptyText={'There are no active calls'}
          emptyImage="/images/actions/18.svg"
        />
      </GridItem>
    );
  };

  const calculateLabelColor = (status) => {
    switch (status) {
      case 'Idle':
        return '#606060';
      case 'InUse':
        return 'green';
      case 'Ringing':
        return '#dc9012e8';
      case 'Paused':
        return 'red';
      default:
        return 'gray';
    }
  };

  const AgentDetail = () => {
    const members =
      typeof memberList === 'string'
        ? JSON.parse(memberList).member
        : memberList?.member || [];

    const statusPriority = {
      Ringing: 1,
      InUse: 2,
      Idle: 3,
      Paused: 4,
    };

    const sortedAgent = members?.sort((a, b) => {
      const statusA = statusPriority[a.status] || Number.MAX_VALUE;
      const statusB = statusPriority[b.status] || Number.MAX_VALUE;
      return statusA - statusB;
    });

    return (
      <Item3>
        <Header>Agent</Header>
        <div
          style={{
            border: '1px solid #eee',
            borderRadius: `${dimensions.unitSpacing - 2}px ${
              dimensions.unitSpacing - 2
            }px`,
            overflowY: 'auto',
            overflowX: 'auto',
            background: '#6aecff',
          }}
        >
          <Table>
            <thead>
              <tr>
                <Th backgroundColor={'#6aecff'}>Extention Status</Th>
                <Th backgroundColor={'#6aecff'}>Extention</Th>
                <Th backgroundColor={'#6aecff'}>Name</Th>
                <Th backgroundColor={'#6aecff'}>Answered</Th>
                <Th backgroundColor={'#6aecff'}>Pause time</Th>
                <Th backgroundColor={'#6aecff'}>Talk time</Th>
              </tr>
            </thead>
            <tbody>
              {(sortedAgent || members)?.map((data, index: number) => {
                return (
                  data.status !== 'Unavailable' && (
                    <tr
                      style={{
                        textAlign: 'left',
                        color:
                          data.status === 'Paused' ? 'red !important' : 'black',
                      }}
                      key={index}
                    >
                      <td>
                        <Label $color={calculateLabelColor(data.status)}>
                          {data.status}
                        </Label>
                      </td>
                      <Td
                        color={data.status === 'Paused' ? 'red' : 'black'}
                        fontWeight={
                          data.status === 'Paused' ? 'normal' : 'bold'
                        }
                      >
                        {data.member_extension || ''}
                      </Td>
                      <Td
                        color={data.status === 'Paused' ? 'red' : 'black'}
                        fontWeight={
                          data.status === 'Paused' ? 'normal' : 'bold'
                        }
                      >
                        {formatName(data.first_name, data.last_name)}
                      </Td>
                      <Td
                        color={data.status === 'Paused' ? 'red' : 'black'}
                        fontWeight={
                          data.status === 'Paused' ? 'normal' : 'bold'
                        }
                      >
                        {data.answer}
                      </Td>
                      <Td
                        color={data.status === 'Paused' ? 'red' : 'black'}
                        fontWeight={
                          data.status === 'Paused' ? 'normal' : 'bold'
                        }
                      >
                        {formatDate(data.pausetime)}
                      </Td>
                      <Td
                        color={data.status === 'Paused' ? 'red' : 'black'}
                        fontWeight={
                          data.status === 'Paused' ? 'normal' : 'bold'
                        }
                      >
                        {formatTime(data.talktime)}
                      </Td>
                    </tr>
                  )
                );
              })}
            </tbody>
          </Table>
        </div>
      </Item3>
    );
  };

  const queues =
    JSON.parse(localStorage.getItem('config:call_integrations') || '{}')
      .queues || [];

  const subMenu = queues.map((queue) => ({
    title: queue,
    link: `/calls/switchboard/${queue}`,
  }));

  return (
    <Wrapper
      header={<Wrapper.Header title={'Call Dashboard'} submenu={subMenu} />}
      content={
        <GridContainer>
          <DataWithLoader
            data={AgentDetail()}
            loading={false}
            count={memberList?.member?.length}
            emptyText={'Theres no agent'}
            emptyImage="/images/actions/18.svg"
          />
          {waitingDetail()}
          {proceedingDetail()}
        </GridContainer>
      }
      hasBorder
    />
  );
}

export default Detail;
