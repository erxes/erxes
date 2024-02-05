import { Table, __ } from '@erxes/ui/src';
import React from 'react';
import { IGoalType } from '../../../../../plugin-goals-ui/src/types';
import dayjs from 'dayjs';
import { DetailBox, DetailBoxContainer } from '../../../styles';

type Props = {
  goal: IGoalType;
  pipelineDetail: any;
  boardDetail: any;
  stageDetail: any;
  userDetail: any;
};

const Detail = (props: Props) => {
  const { goal, pipelineDetail, boardDetail, stageDetail, userDetail } = props;
  const { specificPeriodGoals, progress } = goal;

  return (
    <DetailBoxContainer>
      <DetailBox>
        <li>
          <strong>Montly : </strong>{' '}
          {__(' ' + goal.entity + `, ${userDetail.email}`)}
        </li>
        <li>
          <strong>Contributor : </strong> {goal.contribution}
        </li>
        <li>
          <strong>Gaol type : </strong> {goal.goalTypeChoose}
        </li>
        <li>
          <strong>Board : </strong> {boardDetail.name}
        </li>
        <li>
          <strong>Pipeline : </strong> {pipelineDetail.name}
        </li>
        <li>
          <strong>Stage : </strong> {stageDetail.name}
        </li>
        <li>
          <strong>Duration : </strong>{' '}
          {dayjs(goal.startDate).format('YYYY-MM-DD ')}-{' '}
          {dayjs(goal.endDate).format('YYYY-MM-DD ')}
        </li>
        <li>
          <strong>Target : </strong> {progress?.target}
        </li>
        <li>
          <strong>Progress : </strong> {progress?.progress}%
        </li>
        <li>
          <strong>Month {goal.entity} : </strong>
          {goal.entity +
            ' progressed : ' +
            pipelineDetail.name +
            ', ' +
            stageDetail.name}
        </li>
      </DetailBox>

      {!!(specificPeriodGoals || []).length && (
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
                  {__('Progress')}
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
            {(specificPeriodGoals || []).map((element, index) => (
              <tr key={index}>
                <td>{element.addTarget}</td>
                <td>{progress?.current}</td>
                <td>{element.progress + '%'}</td>
                <td>{element.addMonthly}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </DetailBoxContainer>
  );
};

export default Detail;
