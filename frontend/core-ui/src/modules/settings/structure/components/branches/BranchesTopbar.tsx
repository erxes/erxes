import React from 'react';
import { CreateBranch } from './CreateBranch';
import { StructureViewToggle } from '../StructureViewToggle';

export const BranchesTopbar = () => {
  return (
    <div className="ml-auto flex items-center gap-3">
      <StructureViewToggle />
      <CreateBranch />
    </div>
  );
};
