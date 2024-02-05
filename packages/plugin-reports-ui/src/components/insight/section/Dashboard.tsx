import React from 'react';
import { IGoalType } from '../../../../../plugin-goals-ui/src/types';
import { Box, Icon, SidebarList, router } from '@erxes/ui/src';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';

type Props = {
  queryParams: any;
  history: any;
};

const Dashboard = (props: Props) => {
  const { queryParams, history } = props;

  const items = [
    {
      _id: 'one',
      name: 'One',
    },
    {
      _id: 'two',
      name: 'Two',
    },
    {
      _id: 'three',
      name: 'Three',
    },
    {
      _id: 'four',
      name: 'Four',
    },
  ];

  const handleClick = (_id) => {
    router.removeParams(history, ...Object.keys(queryParams));
    router.setParams(history, { dashboardId: _id });
  };

  const renderContent = () => {
    return (
      <SidebarList>
        <CollapsibleList
          items={items}
          queryParamName="dashboardId"
          queryParams={queryParams}
          icon="chart-pie"
          treeView={false}
          onClick={handleClick}
        />
      </SidebarList>
    );
  };

  const extraButtons = <Icon icon="plus-circle" size={16} />;

  return (
    <Box
      title="Dashboard"
      name="dashboard"
      isOpen={true}
      collapsible={false}
      extraButtons={extraButtons}
    >
      {renderContent()}
    </Box>
  );
};

export default Dashboard;
