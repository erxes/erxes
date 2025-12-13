import React from 'react';

import GoalTypesList from '../modules/goals/containers/goalTypesList';
import Sidebar from '../modules/goals/components/sidebar';

import { PageSubHeader, Empty } from 'erxes-ui';


export const GoalsIndexPage = () => {
  return (
    <div className="flex h-full">
      <Sidebar params={{}} />

      <div className="flex-1 flex flex-col">
        <PageSubHeader className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Goals</h1>
        </PageSubHeader>

        <div className="p-4 flex-1 overflow-auto">
          <GoalTypesList
            queryParams={{}}
            renderEmpty={() => (
              <Empty>
                <Empty.Media />
                <Empty.Title>No goal types yet</Empty.Title>
                <Empty.Description>
                  Add your first goal type to get started.
                </Empty.Description>
              </Empty>
            )}
          />
        </div>
      </div>
    </div>
  );
};
