import React from 'react';
import { CreateBranch } from './CreateBranch';

export const BranchesTopbar = () => {
  return (
    <div className="ml-auto flex items-center gap-3">
      <CreateBranch />
    </div>
  );
};
