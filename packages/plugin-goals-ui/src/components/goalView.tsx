import { BoardHeader } from '@erxes/ui-cards/src/settings/boards/styles';
import { ControlLabel, FormGroup } from '@erxes/ui/src';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import Table from '@erxes/ui/src/components/table';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import { __ } from 'coreui/utils';
import dayjs from 'dayjs';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IGoalType } from '../types';

interface IProps extends RouteComponentProps {
  goalType: IGoalType; // Adjust the type of goalTypes as per your
  boardName: string;
  pipelineName: string;
  stageName: string;
  usersQuery: UsersQueryResponse;
  emailName: string;
  _id: string;
  users: IUser[];
}

class GoalView extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const data = this.props.goalType; // Assuming this.props contains the 'data' object
    const nestedProgressValue = data.progress.progress; // "100.000"
    const current = data.progress.current;
    const boardName = this.props.boardName;
    const pipelineName = this.props.pipelineName;
    const stageName = this.props.stageName;
    const email = this.props.emailName;

    return (
      <div>
        <ControlLabel>
          {__(' Monthly: ' + data.entity + ', ' + email)}
        </ControlLabel>

        <FlexContent>
          <FlexItem>
            <BoardHeader>
              <FormGroup>
                <ControlLabel>
                  {__('Contributor: ') + data.contribution}
                </ControlLabel>
                <ControlLabel>
                  {__('Goal Type: ') + data.goalTypeChoose}
                </ControlLabel>
                <FormGroup>
                  <ControlLabel>
                    {__('Board:  ')}
                    {boardName}
                  </ControlLabel>
                  <ControlLabel>
                    {__('Pipeline:  ')}
                    {pipelineName}
                  </ControlLabel>
                  <ControlLabel>
                    {__('Stage:  ')}
                    {stageName}
                  </ControlLabel>
                </FormGroup>
              </FormGroup>
            </BoardHeader>
          </FlexItem>
          <FlexItem>
            <FormGroup>
              <ControlLabel>
                {__('Duration: ')} {dayjs(data.startDate).format('YYYY-MM-DD ')}
                - {dayjs(data.endDate).format('YYYY-MM-DD ')}
              </ControlLabel>
              <ControlLabel>{__('Current: ') + current}</ControlLabel>
              <ControlLabel>{__('Target: ') + data.target}</ControlLabel>
              <ControlLabel>
                {__('Progress: ') + nestedProgressValue + '%'}
              </ControlLabel>
            </FormGroup>
          </FlexItem>
        </FlexContent>
        <ControlLabel>{__('Month ' + data.entity)}</ControlLabel>
        <FlexContent>
          <FlexItem>
            <BoardHeader>
              <FormGroup>
                <ControlLabel>
                  {__(
                    data.entity +
                      ' progressed: ' +
                      pipelineName +
                      ', ' +
                      stageName
                  )}
                </ControlLabel>
              </FormGroup>
            </BoardHeader>
          </FlexItem>
        </FlexContent>

        <FlexContent>
          <FlexItem>
            <BoardHeader>
              <FormGroup>
                <ControlLabel>
                  {__('Segment: ') + data.segmentCount}
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
                    <th>{__('Target')}</th>
                    <th>{__('Current')}</th>
                    <th> {__('progress(%)')}</th>
                    <th>{__('Month')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.specificPeriodGoals.map((element, index) => (
                    <tr key={index}>
                      <td>{element.addTarget}</td>
                      <td>{current}</td>
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
  }
}

export default withRouter(GoalView);
