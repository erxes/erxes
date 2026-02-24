import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { Card } from 'erxes-ui/components/card';
import { Button } from 'erxes-ui/components/button';
import { Input } from 'erxes-ui/components/input';
import { Label } from 'erxes-ui/components/label';
import { DatePicker } from 'erxes-ui/components/date-picker';

type Props = {
  queryParams: any;
};

const CheckSyncedOrdersSidebar = ({ queryParams }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState({
    search: queryParams.search || '',
    paidStartDate: queryParams.paidStartDate || '',
    paidEndDate: queryParams.paidEndDate || '',
    createdStartDate: queryParams.createdStartDate || '',
    createdEndDate: queryParams.createdEndDate || '',
    userId: queryParams.user || '',
    brandId: queryParams.brandId || '',
  });

  const updateParam = (key: string, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilter = () => {
    if (!state.brandId) {
      alert('Choose brand');
      return;
    }

    const params = new URLSearchParams();

    Object.entries(state).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      }
    });

    params.set('page', '1');

    navigate(`${location.pathname}?${params.toString()}`);
  };

  return (
    <Card className="p-4 space-y-6">
      <div className="text-lg font-semibold">Filters</div>

      {/* Brand */}
      <div className="space-y-2">
        <Label>Brand</Label>
        <Input
          value={state.brandId}
          onChange={(e) => updateParam('brandId', e.target.value)}
          placeholder="Brand ID"
        />
      </div>

      {/* User */}
      <div className="space-y-2">
        <Label>User</Label>
        <Input
          value={state.userId}
          onChange={(e) => updateParam('userId', e.target.value)}
          placeholder="User ID"
        />
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label>Number</Label>
        <Input
          value={state.search}
          onChange={(e) => updateParam('search', e.target.value)}
          placeholder="Search number"
        />
      </div>

      {/* Paid Date Range */}
      <div className="space-y-2">
        <Label>Paid Date Start</Label>
        <DatePicker
          value={
            state.paidStartDate
              ? new Date(state.paidStartDate)
              : undefined
          }
          onChange={(date) =>
            updateParam(
              'paidStartDate',
              date ? dayjs(date as Date).format('YYYY-MM-DD HH:mm') : ''
            )
          }
        />

        <Label>Paid Date End</Label>
        <DatePicker
          value={
            state.paidEndDate
              ? new Date(state.paidEndDate)
              : undefined
          }
          onChange={(date) =>
            updateParam(
              'paidEndDate',
              date ? dayjs(date as Date).format('YYYY-MM-DD HH:mm') : ''
            )
          }
        />
      </div>

      {/* Created Date Range */}
      <div className="space-y-2">
        <Label>Created Date Start</Label>
        <DatePicker
          value={
            state.createdStartDate
              ? new Date(state.createdStartDate)
              : undefined
          }
          onChange={(date) =>
            updateParam(
              'createdStartDate',
              date ? dayjs(date as Date).format('YYYY-MM-DD HH:mm') : ''
            )
          }
        />

        <Label>Created Date End</Label>
        <DatePicker
          value={
            state.createdEndDate
              ? new Date(state.createdEndDate)
              : undefined
          }
          onChange={(date) =>
            updateParam(
              'createdEndDate',
              date ? dayjs(date as Date).format('YYYY-MM-DD HH:mm') : ''
            )
          }
        />
      </div>

      <Button onClick={applyFilter} className="w-full">
        Apply Filter
      </Button>
    </Card>
  );
};

export default CheckSyncedOrdersSidebar;