import React, { useEffect } from 'react';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';

import { menuCall } from '../../constants';
import styled from 'styled-components';
import { Pagination, Table, Label } from '@erxes/ui/src/components';
import { Row } from './Row';
import { dimensions } from '@erxes/ui/src/styles';


const GridContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 10px;
  padding: 10px;
`;

const GridItem = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  text-align: center;
  padding: 20px 0;
`;

const Item3 = styled(GridItem)`
  grid-column: 1 / span 2;
`;

function Detail() {
  useEffect(() => {}, []);

const fakeData = [
  {
    status: 'In Progress',
    caller: 'John',
    callee: 'Jane',
    position: 'Manager',
    waitTime: '5 minutes',
    talkTime: '3 minutes',
    options: 'Transfer',
  },
  {
    status: 'Completed',
    caller: 'Alice',
    callee: 'Bob',
    position: 'Supervisor',
    waitTime: '1 minutes',
    talkTime: '6 minutes',
    options: 'End Call',
  },
  {
    status: 'On Hold',
    caller: 'Mike',
    callee: 'Sarah',
    position: 'Associate',
    waitTime: '6 minutes',
    talkTime: '8 minutes',
    options: 'Resume',
  },
  // Add more objects for additional data rows
];

const agentFakeData = [
  {
    extensionStatus: 'Active',
    extension: '101',
    answered: 20,
    abandoned: 5,
    loginLogoutTime: '08:00 - 17:00',
    pauseResumeTime: '10:00 - 10:15, 12:30 - 13:00',
    talkTime: '02:00:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '102',
    answered: 15,
    abandoned: 3,
    loginLogoutTime: '09:00 - 18:00',
    pauseResumeTime: '11:00 - 11:15, 14:30 - 15:00',
    talkTime: '01:30:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '103',
    answered: 18,
    abandoned: 2,
    loginLogoutTime: '08:30 - 17:30',
    pauseResumeTime: '10:15 - 10:30, 12:45 - 13:15',
    talkTime: '01:45:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '104',
    answered: 10,
    abandoned: 1,
    loginLogoutTime: '09:30 - 18:30',
    pauseResumeTime: '11:30 - 11:45, 15:00 - 15:30',
    talkTime: '01:00:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '105',
    answered: 25,
    abandoned: 6,
    loginLogoutTime: '07:00 - 16:00',
    pauseResumeTime: '09:00 - 09:15, 12:00 - 12:45',
    talkTime: '03:00:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '106',
    answered: 12,
    abandoned: 4,
    loginLogoutTime: '08:30 - 17:30',
    pauseResumeTime: '10:30 - 10:45, 13:00 - 13:30',
    talkTime: '02:30:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '107',
    answered: 18,
    abandoned: 3,
    loginLogoutTime: '08:00 - 17:00',
    pauseResumeTime: '10:15 - 10:30, 12:45 - 13:15',
    talkTime: '02:15:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '108',
    answered: 14,
    abandoned: 2,
    loginLogoutTime: '09:30 - 18:30',
    pauseResumeTime: '11:30 - 11:45, 15:00 - 15:30',
    talkTime: '01:45:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '109',
    answered: 30,
    abandoned: 8,
    loginLogoutTime: '07:00 - 16:00',
    pauseResumeTime: '09:00 - 09:15, 12:00 - 12:45',
    talkTime: '03:30:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '110',
    answered: 16,
    abandoned: 5,
    loginLogoutTime: '08:30 - 17:30',
    pauseResumeTime: '10:30 - 10:45, 13:00 - 13:30',
    talkTime: '02:15:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '111',
    answered: 22,
    abandoned: 4,
    loginLogoutTime: '08:00 - 17:00',
    pauseResumeTime: '10:15 - 10:30, 12:45 - 13:15',
    talkTime: '02:45:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '112',
    answered: 18,
    abandoned: 3,
    loginLogoutTime: '09:30 - 18:30',
    pauseResumeTime: '11:30 - 11:45, 15:00 - 15:30',
    talkTime: '02:00:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '113',
    answered: 28,
    abandoned: 7,
    loginLogoutTime: '07:00 - 16:00',
    pauseResumeTime: '09:00 - 09:15, 12:00 - 12:45',
    talkTime: '03:15:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '114',
    answered: 20,
    abandoned: 6,
    loginLogoutTime: '08:30 - 17:30',
    pauseResumeTime: '10:30 - 10:45, 13:00 - 13:30',
    talkTime: '02:00:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '115',
    answered: 24,
    abandoned: 5,
    loginLogoutTime: '08:00 - 17:00',
    pauseResumeTime: '10:15 - 10:30, 12:45 - 13:15',
    talkTime: '02:30:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '116',
    answered: 17,
    abandoned: 4,
    loginLogoutTime: '09:30 - 18:30',
    pauseResumeTime: '11:30 - 11:45, 15:00 - 15:30',
    talkTime: '01:45:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '117',
    answered: 26,
    abandoned: 8,
    loginLogoutTime: '07:00 - 16:00',
    pauseResumeTime: '09:00 - 09:15, 12:00 - 12:45',
    talkTime: '03:45:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '118',
    answered: 15,
    abandoned: 3,
    loginLogoutTime: '08:30 - 17:30',
    pauseResumeTime: '10:30 - 10:45, 13:00 - 13:30',
    talkTime: '02:00:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '119',
    answered: 21,
    abandoned: 6,
    loginLogoutTime: '08:00 - 17:00',
    pauseResumeTime: '10:15 - 10:30, 12:45 - 13:15',
    talkTime: '02:15:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '120',
    answered: 13,
    abandoned: 2,
    loginLogoutTime: '09:30 - 18:30',
    pauseResumeTime: '11:30 - 11:45, 15:00 - 15:30',
    talkTime: '01:30:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '121',
    answered: 23,
    abandoned: 7,
    loginLogoutTime: '07:00 - 16:00',
    pauseResumeTime: '09:00 - 09:15, 12:00 - 12:45',
    talkTime: '03:00:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '122',
    answered: 16,
    abandoned: 4,
    loginLogoutTime: '08:30 - 17:30',
    pauseResumeTime: '10:30 - 10:45, 13:00 - 13:30',
    talkTime: '02:00:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '123',
    answered: 27,
    abandoned: 8,
    loginLogoutTime: '07:00 - 16:00',
    pauseResumeTime: '09:00 - 09:15, 12:00 - 12:45',
    talkTime: '03:30:00',
    agentStatus: 'Available',
  },
  {
    extensionStatus: 'Inactive',
    extension: '124',
    answered: 19,
    abandoned: 5,
    loginLogoutTime: '08:30 - 17:30',
    pauseResumeTime: '10:30 - 10:45, 13:00 - 13:30',
    talkTime: '02:00:00',
    agentStatus: 'On Break',
  },
  {
    extensionStatus: 'Active',
    extension: '125',
    answered: 22,
    abandoned: 7,
    loginLogoutTime: '07:30 - 16:30',
    pauseResumeTime: '09:45 - 10:00, 12:00 - 12:30',
    talkTime: '02:15:00',
    agentStatus: 'Available',
  },
];



  const renderTable =( isWaitinglist)=>{
    return (
      <div
        style={{
          border: '1px solid #bfbfbf',
          borderRadius: `${dimensions.unitSpacing - 2}px ${dimensions.unitSpacing - 2}px`,
        }}
      >
        <Table>
          <thead>
            <tr>
              <th>{'Status'}</th>
              <th>{'Caller'}</th>
              <th>{'Callee'}</th>
              <th>{'Position'}</th>
              <th>{isWaitinglist ? 'Wait time' : 'Talk time'}</th>
              <th>
                <>{'Options'}</>
              </th>
            </tr>
          </thead>
          <tbody>
            {fakeData?.map((data, index: number) => {
              return <Row callList={data} key={index} />;
            })}
          </tbody>
        </Table>
      </div>
    );
  }
const waitingDetail = ()=>{

 return (
   <GridItem>
     <>
       <h4 style={{ textAlign: 'left', marginLeft: '10px' }}>Waiting</h4>
       {renderTable(true)}
       {/* <Pagination count={count || 0} /> */}
     </>
   </GridItem>
 );
};

const proceedingDetail = () => {
  return (
    <GridItem>
      <h4 style={{ textAlign: 'left', marginLeft: '10px' }}>Proceeding</h4>
      {renderTable(false)}
    </GridItem>
  );
};

const AgentDetail = () => {
  return (
    <Item3>
      <h4 style={{ textAlign: 'left', marginLeft: '10px' }}>Agent</h4>
      <div
        style={{
          border: '1px solid #bfbfbf',
          borderRadius: `${dimensions.unitSpacing - 2}px ${dimensions.unitSpacing - 2}px`,
        }}
      >
        <Table>
          <thead>
            <tr>
              <th>Extention Status</th>
              <th>Extention</th>
              <th>Answered</th>
              <th>Abandoned</th>
              <th>Login/Logout time</th>
              <th>Pause/Resume time</th>
              <th>Talk time</th>
              <th>Agent Status</th>
            </tr>
          </thead>
          <tbody>
            {agentFakeData?.map((data, index: number) => {
              return (
                <tr style={{ textAlign: 'left' }} key={index}>
                  <td>
                    <Label lblStyle={'success'}>{data.extensionStatus}</Label>
                  </td>
                  <td>{data.extension || ''}</td>
                  <td>{data.answered}</td>
                  <td>{data.abandoned}</td>
                  <td>{data.loginLogoutTime}</td>
                  <td>{data.pauseResumeTime}</td>
                  <td>{data.talkTime}</td>
                  <td>{data.agentStatus}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Item3>
  );
};

return (
  <Wrapper
    header={<Wrapper.Header title={'Call Dashboard'} submenu={menuCall()} />}
    content={
      <DataWithLoader
        data={
          <GridContainer>
            {waitingDetail()}
            {proceedingDetail()}
            {AgentDetail()}
          </GridContainer>
        }
        loading={false}
        count={1}
        emptyText={'Theres no calls'}
        emptyImage="/images/actions/8.svg"
      />
    }
    hasBorder
  />
);

  return 
}

export default Detail;
