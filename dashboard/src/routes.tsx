import { Layout } from 'antd';
import DashboardRoutes from 'modules/dashboard/routes';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

const Routes = () => {
  return (
    <Layout style={{ height: '100%' }}>
      <Layout.Content>
        <Router>
          <DashboardRoutes />
        </Router>
      </Layout.Content>
    </Layout>
  );
};

export default Routes;
