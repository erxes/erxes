import { useState } from 'react';
import { IconBuilding, IconSearch } from '@tabler/icons-react';
import { Button, Input, ToggleGroup, useQueryState } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { StructureChartView } from '../../types/chart';
import { StructureChartCanvas } from './StructureChartCanvas';
import { StructureOrganizationSheet } from './StructureOrganizationSheet';
import { StructureSettingsBreadcrumb } from '../StructureSettingsBreadcrumb';
import { CreateBranch } from '../branches/CreateBranch';
import { CreateDepartment } from '../departments/CreateDepartment';
import { CreatePosition } from '../positions/CreatePosition';
import { DepartmentEdit } from '../departments/detail/DepartmentEdit';
import { DepartmentWorkingHoursSheet } from '../departments/detail/DepartmentWorkingHoursSheet';
import { BranchEdit } from '../branches/details/BranchEdit';
import { BranchWorkingHoursSheet } from '../branches/details/BranchWorkingHoursSheet';
import { PositionEdit } from '../positions/detail/PositionEdit';
import { UnitEdit } from '../units/detail/UnitEdit';

const VIEW_OPTIONS: { value: StructureChartView; label: string }[] = [
  { value: 'departments', label: 'Departments' },
  { value: 'branches', label: 'Branches' },
  { value: 'positions', label: 'Positions' },
];

const CreateButton = ({ view }: { view: StructureChartView }) => {
  if (view === 'branches') return <CreateBranch />;
  if (view === 'positions') return <CreatePosition />;
  return <CreateDepartment />;
};

export const StructureChartPage = () => {
  const [viewParam, setViewParam] = useQueryState<string>('view');
  const [search, setSearch] = useState('');

  const view: StructureChartView =
    viewParam === 'branches' || viewParam === 'positions'
      ? viewParam
      : 'departments';

  return (
    <>
      <SettingsHeader breadcrumbs={<StructureSettingsBreadcrumb />}>
        <div className="ml-auto flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(next) => {
              if (next) setViewParam(next);
            }}
            variant="outline"
            className="h-8"
          >
            {VIEW_OPTIONS.map(({ value, label }) => (
              <ToggleGroup.Item key={value} value={value}>
                {label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${view}`}
              className="w-48 pl-8"
            />
          </div>
          <CreateButton view={view} />
          <StructureOrganizationSheet
            trigger={
              <Button size="sm" variant="secondary">
                <IconBuilding /> Organization
              </Button>
            }
          />
        </div>
      </SettingsHeader>
      <div className="flex-1 min-h-0">
        <StructureChartCanvas
          key={view}
          view={view}
          search={search}
          emptyAction={<CreateButton view={view} />}
        />
      </div>

      <DepartmentEdit />
      <BranchEdit />
      <PositionEdit />
      <UnitEdit />
      {view === 'departments' && <DepartmentWorkingHoursSheet />}
      {view === 'branches' && <BranchWorkingHoursSheet />}
    </>
  );
};
