import { Layout } from 'antd';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import DashboardRoutes from './modules/dashboard/routes';

const Routes = () => {
  return (
    <Layout>
      <Layout.Content>
        <Router>
          <DashboardRoutes />
        </Router>
      </Layout.Content>
    </Layout>
  );
};

export default Routes;
