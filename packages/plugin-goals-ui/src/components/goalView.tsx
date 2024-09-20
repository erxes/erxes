import { BoardHeader } from '@erxes/ui-cards/src/settings/boards/styles';
import { __, ControlLabel, FormGroup } from '@erxes/ui/src';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import Table from '@erxes/ui/src/components/table';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import dayjs from 'dayjs';
import React from 'react';
import { IGoalType } from '../types';

type Props = {
  goalType: IGoalType; // Adjust the type of goalTypes as per your
  boardName: string;
  pipelineName: string;
  stageName: string;
  usersQuery: UsersQueryResponse;
  emailName: string;
  _id: string;
  users: IUser[];
};

const GoalView = (props: Props) => {
  const {
    goalType: data,
    boardName,
    pipelineName,
    stageName,
    emailName
  } = props;

  return (
    <div>
      <FormGroup>
        <ControlLabel>
          <span style={{ fontWeight: 'bold', color: 'black' }}>Name:</span>{' '}
          {__(' ' + data.name)}
        </ControlLabel>
        <ControlLabel>
          <span style={{ fontWeight: 'bold', color: 'black' }}>Monthly:</span>{' '}
          {__(' ' + data.entity + ', ' + emailName)}
        </ControlLabel>
      </FormGroup>
      <FlexContent>
        <FlexItem>
          <BoardHeader>
            <FormGroup>
              <ControlLabel>
                <span style={{ fontWeight: 'bold', color: 'black' }}>
                  Contributor:
                </span>{' '}
                {__(' ' + data.contribution)}
              </ControlLabel>

              <ControlLabel>
                <span style={{ fontWeight: 'bold', color: 'black' }}>
                  Goal Type:
                </span>{' '}
                {__(' ' + data.goalTypeChoose)}
              </ControlLabel>

              <FormGroup>
                <ControlLabel>
                  <span style={{ fontWeight: 'bold', color: 'black' }}>
                    Board:
                  </span>{' '}
                  {boardName}
                </ControlLabel>

                <ControlLabel>
                  <span style={{ fontWeight: 'bold', color: 'black' }}>
                    Pipeline:
                  </span>{' '}
                  {pipelineName}
                </ControlLabel>

                <ControlLabel>
                  <span style={{ fontWeight: 'bold', color: 'black' }}>
                    Stage:
                  </span>{' '}
                  {stageName}
                </ControlLabel>
              </FormGroup>
            </FormGroup>
          </BoardHeader>
        </FlexItem>
        <FlexItem>
          <FormGroup>
            <ControlLabel>
              <span style={{ fontWeight: 'bold', color: 'black' }}>
                Duration:
              </span>{' '}
              {dayjs(data.startDate).format('YYYY-MM-DD ')}-{' '}
              {dayjs(data.endDate).format('YYYY-MM-DD ')}
            </ControlLabel>
          </FormGroup>
        </FlexItem>
      </FlexContent>
      <FlexContent>
        <FlexItem>
          <BoardHeader>
            <FormGroup>
              <ControlLabel>
                <span style={{ fontWeight: 'bold', color: 'black' }}>
                  {__('Segment:')}
                </span>{' '}
                {data.segmentCount}
              </ControlLabel>
            </FormGroup>
          </BoardHeader>
        </FlexItem>
      </FlexContent>

      <FlexContent>
        <FlexItem>
          <BoardHeader>
            <Table>
              <thead>
                <tr>
                  <th>
                    <span style={{ fontWeight: 'bold', color: 'black' }}>
                      {__('Target')}
                    </span>
                  </th>
                  <th>
                    <span style={{ fontWeight: 'bold', color: 'black' }}>
                      {__('Current')}
                    </span>
                  </th>
                  <th>
                    <span style={{ fontWeight: 'bold', color: 'black' }}>
                      {__('progress(%)')}
                    </span>
                  </th>
                  <th>
                    <span style={{ fontWeight: 'bold', color: 'black' }}>
                      {__('Month')}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.specificPeriodGoals.map((element, index) => (
                  <tr key={index}>
                    <td>{element.addTarget}</td>
                    <td>{element.current}</td>
                    <td>{element.progress + '%'}</td>
                    <td>{element.addMonthly}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </BoardHeader>
        </FlexItem>
      </FlexContent>
    </div>
  );
};

export default GoalView;
