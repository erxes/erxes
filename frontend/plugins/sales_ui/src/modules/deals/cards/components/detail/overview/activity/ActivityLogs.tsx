import { Button, Tabs } from 'erxes-ui';

import { ACTIVITY_TYPES } from './constants';
import ActivityList from './AcitivityList';
import { useState } from 'react';

const ActivityLogs = () => {
  const [activeType, setActiveType] = useState<string>('All');

  return (
    <div className="px-8 py-4">
      <h4 className="uppercase text-sm text-gray-500 pb-2">Activity</h4>
      <Tabs
        defaultValue={activeType}
        className="flex flex-col h-full shadow-none border-none items-start"
      >
        <Tabs.List className="mb-3 md:mb-4 gap-2">
          {ACTIVITY_TYPES.map((type) => (
            <Tabs.Trigger asChild value={type}>
              <Button
                variant={activeType === type ? 'default' : 'secondary'}
                className="data-[state=active]:bg-background"
                onClick={() => setActiveType(type)}
              >
                {type}
              </Button>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value={activeType} className="h-full w-full">
          <ActivityList />
        </Tabs.Content>
      </Tabs>
    </div>
  );
};

export default ActivityLogs;
