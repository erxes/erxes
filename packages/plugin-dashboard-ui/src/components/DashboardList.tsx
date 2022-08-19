import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import DashbaordForm from '../containers/DashboardForm';
import { Create, Dashboards } from '../styles';
import { IDashboard } from '../types';
import DashboardRow from './DashboardRow';

type Props = {
  dashboard: IDashboard;
  dashboards: IDashboard[];
  loading: boolean;
  currentDashboard?: string;
  removeDashboard: (id: string) => void;
  history: any;
};

function DashboardList(props: Props) {
  const { dashboards, loading, currentDashboard, removeDashboard } = props;

  const renderContent = () => {
    if (loading) {
      return <Spinner objective={true} />;
    }

    return dashboards.map(dashboard => {
      const order = dashboard.order || '';
      const foundedString = order.match(/[/]/gi);

      return (
        <DashboardRow
          isActive={currentDashboard === dashboard._id}
          key={dashboard._id}
          dashboard={dashboard}
          removeDashboard={removeDashboard}
          loading={loading}
          space={foundedString ? foundedString.length : 0}
          dashboards={dashboards}
        />
      );
    });
  };

  const triggerCreate = <Create>Create a Dashboard</Create>;

  return (
    <>
      <Dashboards>{renderContent()}</Dashboards>
      <DashbaordForm
        trigger={triggerCreate}
        dashboards={dashboards}
        loading={loading}
      />
    </>
  );
}

export default DashboardList;
