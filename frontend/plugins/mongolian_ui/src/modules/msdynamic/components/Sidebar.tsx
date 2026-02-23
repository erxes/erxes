import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Sidebar } from 'erxes-ui/components/sidebar';
import { Button } from 'erxes-ui/components/button';
import { Input } from 'erxes-ui/components/input';
import { Label } from 'erxes-ui/components/label';
import { DatePicker } from 'erxes-ui/components/date-picker';

type Props = { queryParams: any };

const generateQueryParams = (location: any) => {
  return Object.fromEntries(new URLSearchParams(location.search));
};

const SideBar = ({ queryParams }: Props) => {
  const [filterParams, setFilterParams] = useState(queryParams);
  const location = useLocation();
  const navigate = useNavigate();

  const setFilter = (name: string, value: any) => {
    setFilterParams((prev: any) => ({ ...prev, [name]: value }));
  };

  const onSelectDate = (value: any, name: string) => {
    const strVal = moment(value).format('YYYY-MM-DD HH:mm');
    setFilter(name, strVal);
  };

  const runFilter = () => {
    const params = new URLSearchParams(filterParams);
    params.set('page', '1');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  return (
    <Sidebar className="p-4 space-y-4">
      <h3 className="text-sm font-semibold">{'Filters'}</h3>

      <div className="space-y-2">
        <Label>User</Label>
        <Input
          value={filterParams.userId || ''}
          onChange={(e) => setFilter('userId', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>{'Start Date'}</Label>
        <DatePicker
          value={filterParams.startDate}
          onChange={(value) => onSelectDate(value, 'startDate')}
        />
      </div>

      <div className="space-y-2">
        <Label>{'End Date'}</Label>
        <DatePicker
          value={filterParams.endDate}
          onChange={(value) => onSelectDate(value, 'endDate')}
        />
      </div>

      <Button onClick={runFilter} className="w-full">
        {'Filter'}
      </Button>
    </Sidebar>
  );
};

export default SideBar;
