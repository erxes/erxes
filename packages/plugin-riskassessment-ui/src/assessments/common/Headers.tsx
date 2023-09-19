import {
  ControlLabel,
  DateControl,
  FormGroup,
  SortHandler,
  Tip,
  Button,
  __
} from '@erxes/ui/src';
import React from 'react';
import {
  SelectIndicatorGroups,
  SelectIndicators,
  SelectOperations
} from '../../common/utils';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { statusColorConstant } from '../../common/constants';
import {
  Box as StatusBox,
  ColorBox,
  CustomRangeContainer,
  EndDateContainer,
  FormContainer as Container
} from '../../styles';
import { DateContainer } from '@erxes/ui/src/styles/main';

export const headers = (queryParams, history) => {
  const handleSelectStructure = (values, name) => {
    removeParams(history, 'page');
    setParams(history, { [name]: [...values] });
  };

  const selectStatus = color => {
    removeParams(history, 'page');
    setParams(history, { status: color });
  };

  const generateQueryParamsDate = params => {
    return params ? new Date(parseInt(params)).toString() : '';
  };

  const dateOrder = (value, name) => {
    removeParams(history, 'page');
    setParams(history, {
      [name]: new Date(value).valueOf()
    });
  };

  const clearParams = field => {
    if (Array.isArray(field)) {
      for (const f of field) {
        removeParams(history, f);
      }
      return;
    }
    removeParams(history, field);
  };

  const clearButton = field => (
    <Button
      icon="cancel-1"
      btnStyle="link"
      size="small"
      onClick={clearParams.bind(this, field)}
    >
      {'Clear'}
    </Button>
  );

  return [
    {
      label: 'Indicators',
      name: 'indicators',
      fields: ['riskIndicatorIds', 'groupIds'],
      filter: {
        actionBar:
          Object.keys(queryParams || {}).some(key =>
            ['riskIndicatorIds', 'groupIds'].includes(key)
          ) && clearButton(['riskIndicatorIds', 'groupIds']),
        main: (
          <>
            <FormGroup>
              <ControlLabel>{`Indicators group`}</ControlLabel>
              <SelectIndicatorGroups
                name="groupIds"
                label="Select indicator groups"
                initialValue={queryParams?.groupIds}
                onSelect={handleSelectStructure}
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{`Indicators`}</ControlLabel>
              <SelectIndicators
                name="riskIndicatorIds"
                label="Select risk indicators"
                initialValue={queryParams?.riskIndicatorIds}
                onSelect={handleSelectStructure}
                multi={true}
              />
            </FormGroup>
          </>
        )
      }
    },
    {
      label: 'Branches',
      name: 'branches',
      filter: {
        actionBar:
          Object.keys(queryParams || {}).includes('branchIds') &&
          clearButton('branchIds'),
        main: (
          <FormGroup>
            <ControlLabel>{__('Branches')}</ControlLabel>
            <SelectBranches
              name="branchIds"
              label="Select Branches"
              initialValue={queryParams?.branchIds}
              onSelect={handleSelectStructure}
              multi={true}
            />
          </FormGroup>
        )
      }
    },
    {
      label: 'Departments',
      name: 'departments',
      filter: {
        actionBar:
          Object.keys(queryParams || {}).includes('departmentIds') &&
          clearButton('departmentIds'),
        main: (
          <FormGroup>
            <ControlLabel>{__('Departments')}</ControlLabel>
            <SelectDepartments
              name="departmentIds"
              label="Select Departments"
              initialValue={queryParams?.departmentIds}
              onSelect={handleSelectStructure}
              multi={true}
            />
          </FormGroup>
        )
      }
    },
    {
      label: 'Operations',
      name: 'operations',
      filter: {
        actionBar:
          Object.keys(queryParams || {}).includes('operationIds') &&
          clearButton('operationIds'),
        main: (
          <FormGroup>
            <ControlLabel>{__('Operations')}</ControlLabel>
            <SelectOperations
              name="operationIds"
              label="Select Operations"
              initialValue={queryParams?.operationIds}
              onSelect={handleSelectStructure}
              multi={true}
            />
          </FormGroup>
        )
      }
    },
    {
      label: 'Status',
      name: 'status',
      filter: {
        actionBar:
          Object.keys(queryParams || {}).includes('status') &&
          clearButton('status'),
        main: (
          <Container row>
            {statusColorConstant.map(status => (
              <StatusBox
                selected={queryParams.Status === status.name}
                onClick={() => selectStatus(status.name)}
                key={status.color}
              >
                <Container justifyCenter row gap align="center">
                  <Tip placement="bottom" text={status.label}>
                    <ColorBox color={status.color} />
                  </Tip>
                </Container>
              </StatusBox>
            ))}
          </Container>
        )
      }
    },
    {
      label: 'Result Score',
      name: 'resultScore'
    },
    {
      label: 'Created At',
      name: 'createdAt',
      sort: <SortHandler sortField="createdAt" />,
      filter: {
        actionBar:
          Object.keys(queryParams || {}).some(key =>
            ['createdAtFrom', 'createdAtTo'].includes(key)
          ) && clearButton(['createdAtFrom', 'createdAtTo']),
        main: (
          <FormGroup>
            <ControlLabel>{__('Created Date Range')}</ControlLabel>
            <CustomRangeContainer>
              <DateContainer>
                <DateControl
                  name="createdAtFrom"
                  value={generateQueryParamsDate(queryParams?.createdAtFrom)}
                  placeholder="select from date "
                  onChange={e => dateOrder(e, 'createdAtFrom')}
                />
              </DateContainer>
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    name="createdAtTo"
                    value={generateQueryParamsDate(queryParams?.createdAtTo)}
                    placeholder="select to date "
                    onChange={e => dateOrder(e, 'createdAtTo')}
                  />
                </DateContainer>
              </EndDateContainer>
            </CustomRangeContainer>
          </FormGroup>
        )
      }
    },
    {
      label: 'Closed At',
      name: 'closedAt',
      sort: <SortHandler sortField="closedAt" />,
      filter: {
        actionBar:
          Object.keys(queryParams || {}).some(key =>
            ['closedAtFrom', 'closedAtFrom'].includes(key)
          ) && clearButton(['closedAtFrom', 'closedAtFrom']),
        main: (
          <FormGroup>
            <ControlLabel>{__('Closed Date Range')}</ControlLabel>
            <CustomRangeContainer>
              <DateContainer>
                <DateControl
                  name="closedAtFrom"
                  value={generateQueryParamsDate(queryParams?.closedAtFrom)}
                  placeholder="select from date "
                  onChange={e => dateOrder(e, 'closedAtFrom')}
                />
              </DateContainer>
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    name="closedAtTo"
                    value={generateQueryParamsDate(queryParams?.closedAtTo)}
                    placeholder="select to date "
                    onChange={e => dateOrder(e, 'closedAtTo')}
                  />
                </DateContainer>
              </EndDateContainer>
            </CustomRangeContainer>
          </FormGroup>
        )
      }
    }
  ];
};
