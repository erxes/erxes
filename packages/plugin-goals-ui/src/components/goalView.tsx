import { withRouter, RouteComponentProps } from 'react-router-dom';
import { IGoalType } from '../types';
import {
  ControlLabel,
  Form,
  DateControl,
  MainStyleFormColumn as FormColumn,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { Button, formatValue, FormControl, ModalTrigger } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import Table from '@erxes/ui/src/components/table';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import { BoardHeader } from '@erxes/ui-cards/src/settings/boards/styles';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IUser } from '@erxes/ui/src/auth/types';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

// Define the type for the props
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
                    {__('Goal Type: ') + data.goalType}
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
                  {__('Frequency: ') + data.frequency}
                </ControlLabel>
                <ControlLabel>
                  {__('Duration: ')} {data.startDate} - {data.endDate}
                </ControlLabel>
                <ControlLabel>{__('Current: ') + current}</ControlLabel>
                <ControlLabel>{__('Target: ') + data.target}</ControlLabel>
                <ControlLabel>
                  {__('Progress: ') + nestedProgressValue}
                </ControlLabel>
              </FormGroup>
            </FlexItem>
          </FlexContent>
        </div>
        <div>
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
        </div>

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
                      <td>
                        {dayjs(element.addMonthly).format('MMM D, h:mm A')}
                      </td>
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
