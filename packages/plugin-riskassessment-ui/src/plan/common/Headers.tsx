import {
  Button,
  ControlLabel,
  DateControl,
  FormGroup,
  SelectTeamMembers,
  SortHandler,
  Tip,
  __
} from '@erxes/ui/src';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import {
  FormContainer as Container,
  CustomRangeContainer,
  EndDateContainer,
  Box as StatusBox
} from '../../styles';

export const headers = (queryParams, history) => {
  const handleSelect = (values, name) => {
    removeParams(history, 'page');
    setParams(history, { [name]: [...values] });
  };

  const selectStatus = color => {
    removeParams(history, 'page');
    setParams(history, { status: color });
  };

  const generateQueryParamsDate = params => {
    return !!params ? new Date(params) : '';
  };

  const dateOrder = (value, name) => {
    removeParams(history, 'page');
    setParams(history, {
      [name]: value
    });
  };

  const clearParams = field => {
    if (Array.isArray(field)) {
      field.forEach(name => {
        return removeParams(history, name);
      });
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
      label: 'Planner',
      name: 'plannerIds',
      fields: ['plannerIds'],
      filter: {
        actionBar:
          Object.keys(queryParams || {}).includes('plannerIds') &&
          clearButton('plannerIds'),
        main: (
          <FormGroup>
            <ControlLabel>{__('Planners')}</ControlLabel>
            <SelectTeamMembers
              name="plannerIds"
              label="Select Planners"
              initialValue={queryParams?.plannerIds}
              onSelect={handleSelect}
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
        main: !queryParams?.isArchived && (
          <Container row>
            {['draft', 'active'].map(status => (
              <StatusBox
                selected={queryParams.status === status}
                onClick={() => selectStatus(status)}
                key={status}
              >
                <Container justifyCenter row gap align="center">
                  <Tip placement="bottom" text={status}>
                    <ControlLabel>{__(status)}</ControlLabel>
                  </Tip>
                </Container>
              </StatusBox>
            ))}
          </Container>
        )
      }
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
      label: 'Modified At',
      name: 'modifiedAt',
      sort: <SortHandler sortField="modifiedAt" />,
      filter: {
        actionBar:
          Object.entries(queryParams || {}).some(
            ([key, value]) =>
              ['modifiedAtFrom', 'modifiedAtTo'].includes(key) && value
          ) && clearButton(['modifiedAtFrom', 'modifiedAtTo']),
        main: (
          <FormGroup>
            <ControlLabel>{__('Modified Date Range')}</ControlLabel>
            <CustomRangeContainer>
              <DateContainer>
                <DateControl
                  name="modifiedAtFrom"
                  value={generateQueryParamsDate(queryParams?.modifiedAtFrom)}
                  placeholder="select from date "
                  onChange={e => dateOrder(e, 'modifiedAtFrom')}
                />
              </DateContainer>
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    name="modifiedAtTo"
                    value={generateQueryParamsDate(queryParams?.modifiedAtTo)}
                    placeholder="select to date "
                    onChange={e => dateOrder(e, 'modifiedAtTo')}
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
