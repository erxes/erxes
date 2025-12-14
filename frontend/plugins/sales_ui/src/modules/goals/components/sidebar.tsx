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

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        if (value.length) {
          searchParams.set(key, value.join(','));
        }
        return;
      }

      searchParams.set(key, String(value));
    });

    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const clearFilter = () => {
    setFilters({});
    navigate(location.pathname);
  };

  const setFilter = (key: string, value: any) => {
    setFilters(prev => ({
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
          <button
            type="button"
            className="text-sm underline"
            onClick={clearFilter}
          >
            Clear
          </button>
        )}
      </div>

      {/* Start Date */}
      <div>
        <label htmlFor="startDate" className="block mb-1">
          Start Date
        </label>
        <input
          id="startDate"
          type="date"
          className="w-full border rounded px-2 py-1"
          value={date || ''}
          onChange={e =>
            setFilter(
              'date',
              e.target.value
                ? dayjs(e.target.value).format('YYYY-MM-DD')
                : null
            )
          }
        />
      </div>

      {/* End Date */}
      <div>
        <label htmlFor="endDate" className="block mb-1">
          End Date
        </label>
        <input
          id="endDate"
          type="date"
          className="w-full border rounded px-2 py-1"
          value={endDate || ''}
          onChange={e =>
            setFilter(
              'endDate',
              e.target.value
                ? dayjs(e.target.value).format('YYYY-MM-DD')
                : null
            )
          }
        />
      </div>

      {/* Branch */}
      <div>
        <label className="block mb-1">
          Branch
          <SelectBranches
            value={branch || undefined}
            onValueChange={(v?: string | string[]) =>
              setFilter('branch', v ?? null)
            }
            mode="single"
          />
        </label>
      </div>

      {/* Department */}
      <div>
        <label className="block mb-1">
          Department
          <SelectDepartments
            value={department || undefined}
            onValueChange={(v?: string | string[]) =>
              setFilter('department', v ?? null)
            }
            mode="single"
          />
        </label>
      </div>

      {/* Unit */}
      <div>
        <label className="block mb-1">
          Unit
          <SelectUnit
            value={unit || undefined}
            onValueChange={(v?: string | string[]) =>
              setFilter('unit', v ?? null)
            }
          >
            Choose unit
          </SelectUnit>
        </label>
      </div>

      {/* Team Member */}
      <div>
        <label className="block mb-1">
          Team Member
          <SelectMember
            value={contribution || null}
            onValueChange={(value: string | string[] | null) =>
              setFilter(
                'contribution',
                Array.isArray(value) ? value[0] : value
              )
            }
            placeholder="Choose member"
          />
        </label>
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
