import Spinner from 'modules/common/components/Spinner';
import React from 'react';
import DashbaordForm from '../containers/DashboardForm';
import { Create, Dashboards } from '../styles';
import { IDashboard } from '../types';
import DashboardRow from './DashboardRow';
import { __ } from 'modules/common/utils';

type Props = {
  dashboards: IDashboard[];
  loading: boolean;
  currentDashboard?: string;
  removeDashboard: (id: string) => void;
};

function DashboardList(props: Props) {
  const { dashboards, loading, currentDashboard, removeDashboard } = props;

  const renderContent = () => {
    if (loading) {
      return <Spinner objective={true} />;
    }

    return dashboards.map(dashboard => (
      <DashboardRow
        isActive={currentDashboard === dashboard._id}
        key={dashboard._id}
        dashboard={dashboard}
        removeDashboard={removeDashboard}
      />
    ));
  };

  const triggerCreate = <Create>{__('Create a Dashboard')}</Create>;

  return (
    <>
      <Dashboards>{renderContent()}</Dashboards>
      <DashbaordForm trigger={triggerCreate} />
    </>
  );
}

export default DashboardList;
