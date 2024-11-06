import {
  Button,
  ControlLabel,
  DateControl,
  FormGroup,
  SortHandler,
  Tip,
  __
} from '@erxes/ui/src';
import { DateContainer } from '@erxes/ui/src/styles/main';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { statusColorConstant } from '../../common/constants';
import {
  SelectIndicatorGroups,
  SelectIndicators,
  SelectOperations
} from '../../common/utils';
import {
  ColorBox,
  FormContainer as Container,
  CustomRangeContainer,
  EndDateContainer,
  Box as StatusBox
} from '../../styles';
import { useLocation, useNavigate } from 'react-router-dom';

export const headers = queryParams => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSelectStructure = (values, name) => {
    removeParams(navigate, location, 'page');
    setParams(navigate, location, { [name]: [...values] });
  };

  const selectStatus = color => {
    removeParams(navigate, location, 'page');
    setParams(navigate, location, { status: color });
  };

  const generateQueryParamsDate = params => {
    return params ? new Date(params) : '';
  };

  const dateOrder = (value, name) => {
    removeParams(navigate, location, 'page');
    setParams(navigate, location, {
      [name]: value
    });
  };

  const clearParams = field => {
    if (Array.isArray(field)) {
      for (const f of field) {
        removeParams(navigate, location, f);
      }
      return;
    }
    removeParams(navigate, location, field);
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
                label={__("Select indicator groups")}
                initialValue={queryParams?.groupIds}
                onSelect={handleSelectStructure}
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{`Indicators`}</ControlLabel>
              <SelectIndicators
                name="riskIndicatorIds"
                label={__("Select risk indicators")}
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
              label={__("Select Operations")}
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
          <Container $row={true}>
            {statusColorConstant.map(status => (
              <StatusBox
                selected={queryParams.Status === status.name}
                onClick={() => selectStatus(status.name)}
                key={status.color}
              >
                <Container
                  $justifyCenter={true}
                  $row={true}
                  $gap={true}
                  align="center"
                >
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
      name: 'resultScore',
      sort: <SortHandler sortField="resultScore" />
    },
    {
      label: 'Created At',
      name: 'createdAt',
      sort: <SortHandler sortField="createdAt" />,
      filter: {
        actionBar:
          Object.entries(queryParams || {}).some(
            ([key, value]) =>
              ['createdAtFrom', 'createdAtTo'].includes(key) && value
          ) && clearButton(['createdAtFrom', 'createdAtTo']),
        main: (
          <FormGroup>
            <ControlLabel>{__('Created Date Range')}</ControlLabel>
            <CustomRangeContainer>
              <DateContainer>
                <DateControl
                  name="createdAtFrom"
                  value={generateQueryParamsDate(queryParams?.createdAtFrom)}
                  placeholder={__("select from date ")}
                  onChange={e => dateOrder(e, 'createdAtFrom')}
                />
              </DateContainer>
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    name="createdAtTo"
                    value={generateQueryParamsDate(queryParams?.createdAtTo)}
                    placeholder={__("select to date ")}
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
          Object.entries(queryParams || {}).some(
            ([key, value]) =>
              ['closedAtFrom', 'closedAtFrom'].includes(key) && value
          ) && clearButton(['closedAtFrom', 'closedAtFrom']),
        main: (
          <FormGroup>
            <ControlLabel>{__('Closed Date Range')}</ControlLabel>
            <CustomRangeContainer>
              <DateContainer>
                <DateControl
                  name="closedAtFrom"
                  value={generateQueryParamsDate(queryParams?.closedAtFrom)}
                  placeholder={__("select from date ")}
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
