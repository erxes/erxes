import { router, __ } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import React, { useState } from 'react';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { EndDateContainer, FlexColumnCustom } from '../../styles';
import { CustomRangeContainer } from '../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Button from '@erxes/ui/src/components/Button';
import { IUser } from '@erxes/ui/src/auth/types';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';

import { DateContainer } from '@erxes/ui/src/styles/main';
import moment from 'moment';

type Props = {
  currentUser: IUser;

  queryParams: any;
  history: any;
};

const LeftSideBar = (props: Props) => {
  const { history, queryParams } = props;
  const [companyId, setCompanyId] = useState('');
  const [userId, setUserId] = useState('');
  const [createdAtFrom, setCreatedForm] = useState(
    queryParams.createdAtFrom || ''
  );

  const [createdAtTo, setCreatedAtTo] = useState(queryParams.createdAtTo || '');

  const cleanFilter = () => {
    router.removeParams(
      history,
      'createdAtFrom',
      'createdAtTo',
      'ownerId',
      'companyId'
    );
    setCompanyId(undefined);
    setCreatedAtTo(undefined);
    setCreatedForm(undefined);
    setUserId(undefined);
    removePageParams();
  };

  const removePageParams = () => {
    router.removeParams(history, 'page', 'perPage');
  };

  const setFilter = (name, value) => {
    if (name === 'companyId') {
      setCompanyId(value);
    }
    if (name === 'ownerId') {
      setUserId(value);
    }
    router.setParams(props.history, { [name]: value });
  };

  const handleSelectDate = (value, name) => {
    if ('createdAtTo' === name) {
      value = moment(value).format(`YYYY/MM/DD hh:mm`);
      setCreatedAtTo(value);
    }
    if ('createdAtFrom' === name) {
      value = moment(value).format(`YYYY/MM/DD hh:mm`);
      setCreatedForm(value);
    }
    value !== 'Invalid date' && router.setParams(history, { [name]: value });
  };

  return (
    <Sidebar wide={true} hasBorder={true}>
      <FlexColumnCustom marginNum={20}>
        <SelectCompanies
          label="Filter by company"
          name="companyId"
          initialValue={companyId}
          onSelect={companyId => setFilter('companyId', companyId)}
          customOption={{ value: '', label: '... Choose company' }}
          multi={false}
        />

        <CustomRangeContainer>
          <DateContainer>
            <DateControl
              name="createdAtFrom"
              placeholder="Choose start date"
              value={createdAtFrom}
              onChange={e => handleSelectDate(e, 'createdAtFrom')}
            />
          </DateContainer>
          <EndDateContainer>
            <DateContainer>
              <DateControl
                name="createdAtTo"
                placeholder="Choose end date"
                value={createdAtTo}
                onChange={e => handleSelectDate(e, 'createdAtTo')}
              />
            </DateContainer>
          </EndDateContainer>
        </CustomRangeContainer>

        <SelectTeamMembers
          label="Filter by created member"
          name="ownerId"
          multi={false}
          initialValue={userId}
          customOption={{ value: '', label: '... Choose created member' }}
          onSelect={ownerId => setFilter('ownerId', ownerId)}
        />

        <Button btnStyle="warning" onClick={cleanFilter}>
          Clear filter
        </Button>
      </FlexColumnCustom>
    </Sidebar>
  );
};

export default LeftSideBar;
