import React from 'react';
import GoalTypesList from '../modules/goals/containers/goalTypesList';
import Sidebar from '../modules/goals/components/sidebar';
import { PageSubHeader } from 'erxes-ui';

export const GoalsIndexPage = () => {
  return (
    <div className="flex h-full">
      {/* Remove Sidebar for now to test */}
      <div className="flex-1 flex flex-col">
        <PageSubHeader className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Goals</h1>
        </PageSubHeader>
        <div className="p-4 flex-1 overflow-auto">
          <GoalTypesList />
        </div>
      </div>
    </div>
  );
};