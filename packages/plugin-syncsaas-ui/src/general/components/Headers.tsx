import React from 'react';
import { Button, DateControl, SortHandler, __ } from '@erxes/ui/src';
import { CustomRangeContainer, EndDateContainer } from '../../styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { FormGroup, ControlLabel } from '@erxes/ui/src/';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';

const generateQueryParamsDate = params => {
  return params ? new Date(params) : '';
};

export const headers = (queryParams, history) => {
  const handleDateChange = (value, name) => {
    removeParams(history, 'page');
    setParams(history, {
      [name]: value
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
      label: 'Start Date',
      name: 'startDate',
      sort: <SortHandler sortField="createdAt" />,
      filter: {
        actionBar:
          Object.entries(queryParams || {}).some(
            ([key, value]) =>
              ['startDateFrom', 'startDateTo'].includes(key) && value
          ) && clearButton(['startDateFrom', 'startDateTo']),
        main: (
          <FormGroup>
            <ControlLabel>{__('Start Date Range')}</ControlLabel>
            <CustomRangeContainer>
              <DateContainer>
                <DateControl
                  name="startDateFrom"
                  value={generateQueryParamsDate(queryParams?.startDateFrom)}
                  placeholder="select from date "
                  onChange={e => handleDateChange(e, 'startDateFrom')}
                />
              </DateContainer>
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    name="startDateTo"
                    value={generateQueryParamsDate(queryParams?.startDateTo)}
                    placeholder="select to date "
                    onChange={e => handleDateChange(e, 'startDateTo')}
                  />
                </DateContainer>
              </EndDateContainer>
            </CustomRangeContainer>
          </FormGroup>
        )
      }
    },
    {
      label: 'Expire Date',
      name: 'expireDate',
      sort: <SortHandler sortField="expireDate" />,
      filter: {
        actionBar:
          Object.entries(queryParams || {}).some(
            ([key, value]) =>
              ['expireDateFrom', 'expireDateTo'].includes(key) && value
          ) && clearButton(['expireDateFrom', 'expireDateTo']),
        main: (
          <FormGroup>
            <ControlLabel>{__('Expire Date Range')}</ControlLabel>
            <CustomRangeContainer>
              <DateContainer>
                <DateControl
                  name="expireDateFrom"
                  value={generateQueryParamsDate(queryParams?.expireDateFrom)}
                  placeholder="select from date "
                  onChange={e => handleDateChange(e, 'expireDateFrom')}
                />
              </DateContainer>
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    name="expireDateTo"
                    value={generateQueryParamsDate(queryParams?.expireDateTo)}
                    placeholder="select to date "
                    onChange={e => handleDateChange(e, 'expireDateTo')}
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
