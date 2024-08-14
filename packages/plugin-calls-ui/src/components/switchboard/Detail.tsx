import React from 'react';

import styled from 'styled-components';
import { Table, Label } from '@erxes/ui/src/components';
import { Row } from './Row';
import { dimensions } from '@erxes/ui/src/styles';
import { IQueueDoc, IWaitingCall } from '../../types';
import { formatTime } from '../../utils';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 20px;
  padding: 20px;
`;

const GridItem = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  text-align: center;
`;

const Item3 = styled(GridItem)`
  grid-column: 1 / span 2;
  padding: 20px 0;
`;

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
  function formatName(firstName, lastName) {
    const lastInitial = lastName?.charAt(0).toUpperCase();

    return `${lastInitial}.${firstName}`;
  }

  const renderTable = (list, isWaitinglist) => {
    return (
      <div
        style={{
          border: '1px solid #eee',
          borderRadius: `${dimensions.unitSpacing - 2}px ${dimensions.unitSpacing - 2}px`,
        }}
      >
        <Table $hover={true}>
          <thead>
            <tr>
              <th>{'Status'}</th>
              <th>{'Caller'}</th>
              {!isWaitinglist && <th>{'Callee'}</th>}
              <th>{isWaitinglist ? 'Wait time' : 'Talk time'}</th>
            </tr>
          </thead>
          <tbody>
            {list?.map((data, index: number) => {
              return (
                <Row callList={data} key={index} isWaiting={isWaitinglist} />
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };
  const waitingDetail = () => {
    let members =
      typeof waitingList === 'string'
        ? JSON.parse(waitingList).member
        : waitingList?.member || [];

    let initialMembers =
      typeof initialWaitingCall === 'string'
        ? JSON.parse(initialWaitingCall).member
        : initialWaitingCall?.member || [];
    return (
      <GridItem>
        <>
          <h4 style={{ textAlign: 'left', margin: '0 0 20px 0' }}>Waiting</h4>
          <DataWithLoader
            data={renderTable(
              members.length > 0 ? members : initialMembers,
              true,
            )}
            loading={false}
            count={members?.length ? members?.length : initialMembers?.length}
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
        : proceedingList?.member || [];

    let initialMembers =
      typeof initialTalkingCall === 'string'
        ? JSON.parse(initialTalkingCall).member
        : initialTalkingCall?.member || [];

    return (
      <GridItem>
        <h4 style={{ textAlign: 'left', margin: '0 0 20px 0' }}>Talking</h4>
        <DataWithLoader
          data={renderTable(
            members.length > 0 ? members : initialMembers,
            false,
          )}
          loading={false}
          count={members?.length ? members?.length : initialMembers?.length}
          emptyText={'There are no active calls'}
          emptyImage="/images/actions/18.svg"
        />
      </GridItem>
    );
  };

  const calculateLabelStyle = (status) => {
    switch (status) {
      case 'Idle':
        return 'success';
      case 'InUse':
        return 'warning';
      case 'Ringing':
        return 'default';
      case 'Paused':
        return 'danger';
      default:
        return 'simple';
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
        <h4 style={{ textAlign: 'left', margin: '0 0 20px 0' }}>Agent</h4>
        <div
          style={{
            border: '1px solid #eee',
            borderRadius: `${dimensions.unitSpacing - 2}px ${dimensions.unitSpacing - 2}px`,
          }}
        >
          <Table $hover={true}>
            <thead>
              <tr>
                <th>Extention Status</th>
                <th>Extention</th>
                <th>Name</th>
                <th>Answered</th>
                <th>Abandoned</th>
                {/* <th>Login/Logout time</th> */}
                <th>Pause/Resume time</th>
                <th>Talk time</th>
              </tr>
            </thead>
            <tbody>
              {(sortedAgent || members)?.map((data, index: number) => {
                return (
                  data.status !== 'Unavailable' && (
                    <tr style={{ textAlign: 'left' }} key={index}>
                      <td>
                        <div
                          style={{
                            width: '50%',
                            textAlign: 'center',
                            fontSize: '10px',
                          }}
                        >
                          <Label lblStyle={calculateLabelStyle(data.status)}>
                            {data.status}
                          </Label>
                        </div>
                      </td>
                      <td>{data.member_extension || ''}</td>
                      <td>{formatName(data.first_name, data.last_name)}</td>
                      <td>{data.answer}</td>
                      <td>{data.abandon}</td>
                      {/* <td>{data.logintime}</td> */}
                      <td>{data.pausetime}</td>
                      <td>{formatTime(data.talktime)}</td>
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
          {waitingDetail()}
          {proceedingDetail()}
          {
            <DataWithLoader
              data={AgentDetail()}
              loading={false}
              count={memberList?.member?.length}
              emptyText={'Theres no agent'}
              emptyImage="/images/actions/18.svg"
            />
          }
        </GridContainer>
      }
      hasBorder
    />
  );
}

export default Detail;
