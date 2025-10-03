import React from 'react';
import { CreateDepartment } from './CreateDepartment';

export const DepartmentsTopbar = () => {
  return (
    <div className="ml-auto flex items-center gap-3">
      <CreateDepartment />
    </div>
  );
};
