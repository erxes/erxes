import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import { EndDateContainer } from '@erxes/ui-forms/src/forms/styles';
import { Icon, router } from '@erxes/ui/src';
import Box from '@erxes/ui/src/components/Box';
import { ControlLabel } from '@erxes/ui/src/components/form';
import Tip from '@erxes/ui/src/components/Tip';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { __ } from '@erxes/ui/src/utils/core';
import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CustomRangeContainer,
  ExtraButtons,
  FilterContainer,
} from '../../../styles';
import { filterOptions } from '../constants';

type Props = {
  queryParams: any;
  refetch: (variable: any) => void;
};

const FilterCampaign = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { queryParams } = props;

  const clearCategoryFilter = (field?: string[]) => {
    let params = [
      'page',
      'ownerType',
      'orderType',
      'order',
      'ownerId',
      'fromDate',
      'toDate',
    ];

    if (field?.length) {
      params = field;
    }

    router.removeParams(navigate, location, ...params);
  };

  const handleOnChange = (field, value) => {
    value = String(value);

    if (!value && field === 'ownerType') {
      return clearCategoryFilter(['ownerType', 'ownerId']);
    }

    if (!value && field === 'orderType') {
      return clearCategoryFilter(['orderType', 'order']);
    }

    if (!value) {
      return clearCategoryFilter([field]);
    }

    if (field === 'fromDate' || field === 'toDate') {
      value = dayjs(value).format('YYYY/MM/DD');
    }

    router.setParams(navigate, location, { [field]: value });
  };

  const renderOwner = () => {
    if (queryParams.ownerType === 'customer') {
      return (
        <SelectCustomers
          label="Customers"
          name="ownerId"
          multi={false}
          initialValue={queryParams?.ownerId}
          onSelect={(value) => handleOnChange('ownerId', value)}
        />
      );
    }

    if (queryParams.ownerType === 'user') {
      return (
        <SelectTeamMembers
          label="Team Members"
          name="ownerId"
          multi={false}
          initialValue={queryParams?.ownerId}
          onSelect={(value) => handleOnChange('ownerId', value)}
        />
      );
    }

    if (queryParams.ownerType === 'company') {
      return (
        <SelectCompanies
          label="Company"
          name="ownerId"
          multi={false}
          initialValue={queryParams?.ownerId}
          onSelect={(value) => handleOnChange('ownerId', value)}
        />
      );
    }

    return <></>;
  };

  const renderDateRange = () => {
    return (
      <FilterContainer>
        <ControlLabel>{`Created Date range:`}</ControlLabel>
        <CustomRangeContainer>
          <DateContainer>
            <Datetime
              dateFormat="YYYY/MM/DD"
              value={queryParams['fromDate'] || null}
              onChange={(date) => handleOnChange('fromDate', date)}
              className={'filterDate'}
              viewMode={'days'}
              inputProps={{ placeholder: __('From') }}
              timeFormat=""
            />
          </DateContainer>
          <EndDateContainer>
            <DateContainer>
              <Datetime
                dateFormat="YYYY/MM/DD"
                value={queryParams['toDate'] || null}
                onChange={(date) => handleOnChange('toDate', date)}
                className={'filterDate'}
                viewMode={'days'}
                inputProps={{ placeholder: __('To') }}
                timeFormat=""
              />
            </DateContainer>
          </EndDateContainer>
        </CustomRangeContainer>
      </FilterContainer>
    );
  };

  const renderExtraButtons = (field) => {
    let content;

    if (
      field === 'date' &&
      (queryParams['fromDate'] || queryParams['toDate'])
    ) {
      content = (
        <Icon
          icon="times-circle"
          onClick={() => clearCategoryFilter(['fromDate', 'toDate'])}
        />
      );
    }

    if (queryParams[field]) {
      content = (
        <Icon icon="times-circle" onClick={() => handleOnChange(field, '')} />
      );
    }

    return (
      <ExtraButtons>
        <Tip text={'Clear Filter'}>{content}</Tip>
      </ExtraButtons>
    );
  };

  const renderOptions = (
    field: string,
    title: string,
    child?: React.ReactNode,
  ) => {
    return (
      <Box
        title={__(`Filter by ${title}`)}
        name={`showFilterBy${field}`}
        isOpen={true}
        extraButtons={renderExtraButtons(field)}
      >
        {child || (
          <SidebarList>
            {filterOptions[field].map(
              ({ value, label }: { value: string; label: string }) => {
                return (
                  <li key={Math.random()}>
                    <a
                      href="#filter"
                      tabIndex={0}
                      className={
                        queryParams[field] === String(value) ? 'active' : ''
                      }
                      onClick={() => handleOnChange(field, value)}
                    >
                      <FieldStyle>{label}</FieldStyle>
                    </a>
                  </li>
                );
              },
            )}

            {queryParams['ownerType'] && field === 'ownerType' && (
              <FilterContainer>{renderOwner()}</FilterContainer>
            )}
          </SidebarList>
        )}
      </Box>
    );
  };

  return (
    <>
      {renderOptions('ownerType', 'Owner Type')}
      {renderOptions('orderType', 'Order Type')}
      {queryParams['orderType'] && renderOptions('order', 'Order')}
      {renderOptions('date', 'Date', renderDateRange())}
    </>
  );
};

export default FilterCampaign;
