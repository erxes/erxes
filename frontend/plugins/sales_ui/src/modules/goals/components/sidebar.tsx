import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

import { Button } from 'erxes-ui';
import {
  SelectBranches,
  SelectDepartments,
  SelectUnit,
  SelectMember
} from 'ui-modules';

type Props = {
  params: Record<string, any>;
};

const Sidebar = ({ params }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    setFilters(params);
  }, [params]);

  const updateURLParams = (newParams: Record<string, any>) => {
    const searchParams = new URLSearchParams();

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        return;
      }

      if (Array.isArray(val)) {
        if (val.length) {
          searchParams.set(key, val.join(','));
        }
        return;
      }

      searchParams.set(key, String(val));
    });

    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const clearFilter = () => {
    setFilters({});
    navigate(location.pathname);
  };

  const setFilter = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const runFilter = () => {
    updateURLParams(filters);
  };

  const { branch, department, unit, date, endDate, contribution } = filters;

  return (
    <div className="sidebar border-r p-4 w-64 space-y-4">

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Filters</h3>

        {Object.keys(filters).length > 0 && (
          <button className="text-sm underline" onClick={clearFilter}>
            Clear
          </button>
        )}
      </div>

      <div>
        <label className="block mb-1">Start Date</label>
        <input
          type="date"
          className="w-full border rounded px-2 py-1"
          value={date || ''}
          onChange={(e) =>
            setFilter(
              'date',
              e.target.value
                ? dayjs(e.target.value).format('YYYY-MM-DD')
                : null
            )
          }
        />
      </div>

      <div>
        <label className="block mb-1">End Date</label>
        <input
          type="date"
          className="w-full border rounded px-2 py-1"
          value={endDate || ''}
          onChange={(e) =>
            setFilter(
              'endDate',
              e.target.value
                ? dayjs(e.target.value).format('YYYY-MM-DD')
                : null
            )
          }
        />
      </div>

      <div>
        <label className="block mb-1">Branch</label>
        <SelectBranches
          value={branch || undefined}
          onValueChange={(v?: string | string[]) =>
            setFilter('branch', v ?? null)
          }
          mode="single"
        />
      </div>

      <div>
        <label className="block mb-1">Department</label>
        <SelectDepartments
          value={department || undefined}
          onValueChange={(v?: string | string[]) =>
            setFilter('department', v ?? null)
          }
          mode="single"
        />
      </div>

      <div>
        <label className="block mb-1">Unit</label>
        <SelectUnit
          value={unit || undefined}
          onValueChange={(v?: string | string[]) =>
            setFilter('unit', v ?? null)
          }
        >
          Choose unit
        </SelectUnit>
      </div>

      <div>
        <label className="block mb-1">Team Member</label>
        <SelectMember
          value={contribution || null}
          onValueChange={(value: string | string[] | null) =>
            setFilter('contribution', 
              Array.isArray(value) ? value[0] : value
            )
          }
          placeholder="Choose member"
        />
      </div>

      <div>
        <Button onClick={runFilter} className="w-full">
          Apply Filter
        </Button>
      </div>

    </div>
  );
};

export default Sidebar;
