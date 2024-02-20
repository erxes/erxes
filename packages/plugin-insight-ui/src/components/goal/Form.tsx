import React, { useState } from 'react';
// import {
//   IGoalType,
//   IGoalTypeDoc
// } from '../../../../../plugin-goals-ui/src/types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import {
  ControlLabel,
  FormControl,
  FormGroup,
  __,
  Form as CommonForm,
  DateControl,
  SelectTeamMembers,
  Button,
} from '@erxes/ui/src';
import Select from 'react-select-plus';

import {
  CONTRIBUTION,
  ENTITY,
  GOAL_STRUCTURE,
  GOAL_TYPE,
  METRIC,
  SPECIFIC_PERIOD_GOAL,
} from '../../constants';

import { isEnabled } from '@erxes/ui/src/utils/core';
import {
  DateContainer,
  FormColumn,
  FormWrapper,
  ModalFooter,
  ScrollWrapper,
} from '@erxes/ui/src/styles/main';
import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { FilterContainer } from '@erxes/ui-settings/src/styles';
import { CustomRangeContainer } from '@erxes/ui-cards/src/boards/styles/rightMenu';
import { EndDateContainer } from '@erxes/ui-forms/src/forms/styles';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectUnits from '@erxes/ui/src/team/containers/SelectUnits';
import { FormContent, FormFooter } from '../../styles';
import { IGoalType } from '../../types';

type Props = {
  queryParams: any;
  history: any;

  goal?: IGoalType;

  closeDrawer: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const Form = (props: Props) => {
  const { goal = {} as any, closeDrawer, renderButton } = props;

  const [entity, setEntity] = useState<string>(goal.entity || ENTITY[0].value);
  const [stageRadio, setStageRadio] = useState<boolean>(
    goal.stageRadio || false,
  );
  const [segmentRadio, setSegmentRadio] = useState<boolean>(
    goal.segmentRadio || false,
  );
  const [segmentIds, setSegmentIds] = useState<string | string[]>(
    goal.segmentIds || [],
  );

  const [stageId, setstageId] = useState<string>(goal.stageId);
  const [pipelineId, setpipelineId] = useState<string>(goal.pipelineId);
  const [boardId, setboardId] = useState<string>(goal.boardId);

  const [periodGoal, setPeriodGoal] = useState<string>(
    goal.periodGoal || SPECIFIC_PERIOD_GOAL[0].value,
  );
  const [goalTypeChoose, setGoalTypeChoose] = useState<string>(
    goal.goalTypeChoose || GOAL_TYPE[0].value,
  );
  const [startDate, setStartDate] = useState<Date>(
    goal.startDate || new Date(),
  );
  const [endDate, setEndDate] = useState<Date>(goal.endDate || new Date());
  const [contribution, setContribution] = useState<string | string[]>(
    goal.contribution || '',
  );
  const [contributionType, setContributionType] = useState<string>(
    goal.contributionType || CONTRIBUTION[0].value,
  );
  const [teamGoalType, setTeamGoalType] = useState<string>(goal.teamGoalType);
  const [department, setDepartment] = useState<string | string[]>(
    goal.department || [],
  );
  const [unit, setUnit] = useState<string | string[]>(goal.unit || []);
  const [branch, setBranch] = useState<string | string[]>(goal.branch || []);
  const [metric, setMetric] = useState<string>(goal.metric || METRIC[0].value);
  const [target, setTarget] = useState<number>(goal.target || 0);

  const [specificPeriodGoals, setspecificPeriodGoals] = useState<
    Array<{
      _id: string;
      addMonthly: string;
      addTarget: number;
    }>
  >(goal.specificPeriodGoals || []);

  const generateOptions = (options) => {
    return options.map((option) => ({
      label: option.name,
      value: option.value,
    }));
  };

  const generateDoc = (values: { _id: string } & any) => {
    const finalValues = values;
    if (goal) {
      finalValues._id = goal._id;
    }

    return {
      _id: finalValues._id,
      entity,
      department,
      unit,
      branch,
      segmentIds,
      specificPeriodGoals,
      stageRadio,
      segmentRadio,
      stageId,
      pipelineId,
      boardId,
      contribution,
      contributionType,
      metric,
      goalTypeChoose,
      teamGoalType,
      periodGoal,
      startDate,
      endDate,
      target,
    };
  };

  const onChangeTarget = (date, event) => {
    const { value } = event.target;
    const parsedValue = parseInt(value);
    const updatedSpecificPeriodGoals = specificPeriodGoals.map((goal) =>
      goal.addMonthly === date ? { ...goal, addTarget: parsedValue } : goal,
    );

    const periods =
      periodGoal === 'Monthly'
        ? mapMonths(startDate, endDate)
        : mapWeeks(startDate, endDate);

    periods.forEach((period) => {
      const exists = updatedSpecificPeriodGoals.some(
        (goal) => goal.addMonthly === period,
      );
      if (!exists) {
        updatedSpecificPeriodGoals.push({
          _id: Math.random().toString(),
          addMonthly: period,
          addTarget: NaN,
        });
      }
    });

    const filteredGoals = updatedSpecificPeriodGoals.filter(
      (goal) =>
        (periodGoal === 'Monthly' && goal.addMonthly.includes('Month')) ||
        (periodGoal === 'Weekly' && goal.addMonthly.includes('Week')),
    );

    setspecificPeriodGoals(filteredGoals);
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const months: string[] = mapMonths(startDate, endDate);
    const weeks = mapWeeks(startDate, endDate);

    return (
      <>
        <FormContent>
          <FormGroup>
            <ControlLabel>{__('Choose Entity')}</ControlLabel>
            <Select
              placeholder={__('Choose a entity')}
              value={entity}
              onChange={(selectedOption) => setEntity(selectedOption.value)}
              options={generateOptions(ENTITY)}
              clearable={false}
            />
          </FormGroup>

          <FormGroup>
            <FormControl
              {...formProps}
              componentClass="checkbox"
              name="stageRadio"
              checked={stageRadio}
              onChange={(e) =>
                setStageRadio((e.target as HTMLInputElement).checked)
              }
              inline={true}
            >
              {__('Stage')}
            </FormControl>
            <FormControl
              {...formProps}
              componentClass="checkbox"
              name="segmentRadio"
              checked={segmentRadio}
              onChange={(e) =>
                setSegmentRadio((e.target as HTMLInputElement).checked)
              }
              inline={true}
            />
            {__('Segment')}
          </FormGroup>

          {segmentRadio && isEnabled('segments') && isEnabled('contacts') && (
            <FormGroup>
              <ControlLabel>Segments</ControlLabel>
              <SelectSegments
                name="segmentIds"
                label="Choose segments"
                contentTypes={[`cards:${entity}`]}
                initialValue={segmentIds}
                multi={true}
                onSelect={(segmentIds) => setSegmentIds(segmentIds)}
              />
            </FormGroup>
          )}

          {stageRadio && isEnabled('cards') && (
            <FormGroup>
              <BoardSelect
                type={entity}
                stageId={stageId}
                pipelineId={pipelineId}
                boardId={boardId}
                onChangeStage={(id) => setstageId(id)}
                onChangePipeline={(id) => setpipelineId(id)}
                onChangeBoard={(id) => setboardId(id)}
              />
            </FormGroup>
          )}

          <FilterContainer>
            <ControlLabel>{`Duration`}</ControlLabel>
            <CustomRangeContainer>
              <DateContainer>
                <DateControl
                  {...formProps}
                  required={false}
                  name="startDate"
                  value={startDate}
                  onChange={(date) => setStartDate(date as any)}
                />
              </DateContainer>
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="endDate"
                    value={endDate}
                    onChange={(date) => setEndDate(date as any)}
                  />
                </DateContainer>
              </EndDateContainer>
            </CustomRangeContainer>
          </FilterContainer>

          <FormGroup>
            <ControlLabel>{__('Choose goal type')}</ControlLabel>

            <Select
              placeholder={__('Choose goal type')}
              value={goalTypeChoose}
              onChange={(selectedOption) =>
                setGoalTypeChoose(selectedOption.value)
              }
              options={generateOptions(GOAL_TYPE)}
              clearable={false}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__('Contribution type')}</ControlLabel>

            <Select
              placeholder={__('Choose a contribution type')}
              value={contributionType}
              onChange={(selectedOption) =>
                setContributionType(selectedOption.value)
              }
              options={generateOptions(CONTRIBUTION)}
              clearable={false}
            />
          </FormGroup>

          {contributionType === 'person' && (
            <FormGroup>
              <ControlLabel>contribution</ControlLabel>
              <SelectTeamMembers
                label="Choose users"
                name="userId"
                customOption={{ label: 'Choose user', value: '' }}
                initialValue={contribution || ''}
                onSelect={(userId) => setContribution(userId)}
                multi={false}
              />
            </FormGroup>
          )}
          {contributionType === 'team' && (
            <FormGroup>
              <ControlLabel>{__('Choose Structure')}</ControlLabel>

              <Select
                placeholder={__('Choose Structure')}
                value={teamGoalType}
                onChange={(selectedOption) =>
                  setTeamGoalType(selectedOption.value)
                }
                options={generateOptions(GOAL_STRUCTURE)}
                clearable={false}
              />
            </FormGroup>
          )}

          {teamGoalType === 'Departments' && contributionType === 'team' && (
            <FormGroup>
              <ControlLabel>{__('Departments')}</ControlLabel>
              <SelectDepartments
                name="branchId"
                label={__('Choose Departments')}
                initialValue={department}
                onSelect={(selectedOption) => setDepartment(selectedOption)}
                multi={false}
              />
            </FormGroup>
          )}

          {teamGoalType === 'Units' && contributionType === 'team' && (
            <FormGroup>
              <ControlLabel>{__('Units')}</ControlLabel>
              <SelectUnits
                name="branchId"
                label={__('Choose Units')}
                initialValue={unit}
                onSelect={(selectedOption) => setUnit(selectedOption)}
                multi={false}
              />
            </FormGroup>
          )}

          {teamGoalType === 'Branches' && contributionType === 'team' && (
            <FormGroup>
              <ControlLabel>{__('Branches')}</ControlLabel>
              <SelectBranches
                name="branchId"
                label={__('Choose Branches')}
                initialValue={branch}
                onSelect={(selectedOption) => setBranch(selectedOption)}
                multi={false}
              />
            </FormGroup>
          )}

          <FormGroup>
            <ControlLabel>{__('Metric')}:</ControlLabel>

            <Select
              placeholder={__('choose metric')}
              value={metric}
              onChange={(selectedOption) => setMetric(selectedOption.value)}
              options={generateOptions(METRIC)}
              clearable={false}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__('Target')}</ControlLabel>
            <FormGroup>
              <FormControl
                type="number"
                name="target"
                value={target}
                onChange={(e) => setTarget(parseInt((e.target as any).value))}
              />
            </FormGroup>
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__('choose specific period goals')}</ControlLabel>

            <Select
              placeholder={__('choose specific period goals')}
              value={periodGoal}
              onChange={(selectedOption) => setPeriodGoal(selectedOption.value)}
              options={generateOptions(SPECIFIC_PERIOD_GOAL)}
              clearable={false}
            />
          </FormGroup>

          {periodGoal === 'Monthly' && (
            <div>
              {months.map((month) => (
                <FormWrapper key={month}>
                  <FormColumn>
                    <ControlLabel>{__('Period (Monthly)')}</ControlLabel>
                    <FormGroup>
                      <DateContainer>{month}</DateContainer>
                    </FormGroup>
                  </FormColumn>
                  <FormColumn>
                    <ControlLabel>{__('Target')}</ControlLabel>
                    <FormGroup>
                      <FormControl
                        type="number"
                        name="target"
                        value={
                          specificPeriodGoals.find(
                            (goal) => goal.addMonthly === month,
                          )?.addTarget || 0
                        }
                        onChange={(event) => onChangeTarget(month, event)}
                      />
                    </FormGroup>
                  </FormColumn>
                </FormWrapper>
              ))}
            </div>
          )}
          {periodGoal === 'Weekly' && (
            <div>
              {weeks.map((week) => (
                <FormWrapper key={week}>
                  <FormColumn>
                    <ControlLabel>{__('Period (Weekly)')}</ControlLabel>
                    <FormGroup>
                      <DateContainer>{week}</DateContainer>
                    </FormGroup>
                  </FormColumn>
                  <FormColumn>
                    <ControlLabel>{__('Target')}</ControlLabel>
                    <FormGroup>
                      <FormControl
                        type="number"
                        name="target"
                        value={
                          specificPeriodGoals.find(
                            (goal) => goal.addMonthly === week,
                          )?.addTarget || 0
                        }
                        onChange={(event) => onChangeTarget(week, event)}
                      />
                    </FormGroup>
                  </FormColumn>
                </FormWrapper>
              ))}
            </div>
          )}
        </FormContent>

        <FormFooter>
          <Button btnStyle="simple" onClick={closeDrawer}>
            {__('Cancel')}
          </Button>
          {renderButton({
            name: 'Goal',
            values: generateDoc(values),
            isSubmitted,
            object: props.goal,
          })}
        </FormFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

const mapMonths = (startDate: Date, endDate: Date): string[] => {
  const startDateObject = new Date(startDate); // Ensure startDate is a Date object
  const endDateObject = new Date(endDate); // Ensure endDate is a Date object
  const startMonth = startDateObject.getMonth();
  const endMonth = endDateObject.getMonth();
  const year = startDateObject.getFullYear(); //
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const months: string[] = [];

  for (let i = startMonth; i <= endMonth; i++) {
    months.push(`Month of ${monthNames[i]} ${year}`);
  }
  return months;
};

const mapWeeks = (startDate: Date, endDate: Date): string[] => {
  const weeks: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekString = `Week of ${weekStart.toDateString()} - ${weekEnd.toDateString()}`;

    weeks.push(weekString);

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
};

export default Form;
