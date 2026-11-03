import React from 'react';
import { CreateDepartment } from './CreateDepartment';
import { StructureViewToggle } from '../StructureViewToggle';

export const DepartmentsTopbar = () => {
  return (
    <div className="ml-auto flex items-center gap-3">
      <StructureViewToggle />
      <CreateDepartment />
    </div>
  );
};
