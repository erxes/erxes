import { DashboardItems, Dashboards } from '../db/models';

import './setup.ts';

describe('Brands db', () => {
  afterEach(async () => {
    // Clearing test data
    await Dashboards.deleteMany({});
    await DashboardItems.deleteMany({});
  });

  test('Add dashboard', async () => {
    const dashboardObj = await Dashboards.addDashboard({ name: 'dashboard' });

    expect(dashboardObj).toBeDefined();
    expect(dashboardObj.name).toBe('dashboard');
  });

  test('Update dashboard', async () => {
    const dashboardObjPrev = await Dashboards.addDashboard({
      name: 'dashboard'
    });

    const updatedDashboard = await Dashboards.editDashboard(
      dashboardObjPrev._id,
      { name: 'updatedDashboard' }
    );

    expect(updatedDashboard.name).toBe('updatedDashboard');
  });

  test('Delete dashboard', async () => {
    const dashboardObjPrev = await Dashboards.addDashboard({
      name: 'dashboard'
    });
    await Dashboards.removeDashboard(dashboardObjPrev._id);

    const dashboardCount = await Dashboards.countDocuments();

    expect(dashboardCount).toBe(0);
  });

  test('Add dashboard', async () => {
    const dashboardObj = await DashboardItems.addDashboardItem({
      name: 'dashboard',
      dashboardId: 'dashboardId',
      layout: 'layout',
      vizState: 'vizState',
      type: 'type'
    });

    expect(dashboardObj).toBeDefined();
    expect(dashboardObj.name).toBe('dashboard');
  });

  test('Update dashboard', async () => {
    const dashboardObjPrev = await DashboardItems.addDashboardItem({
      name: 'dashboard',
      dashboardId: 'dashboardId',
      layout: 'layout',
      vizState: 'vizState',
      type: 'type'
    });

    const updatedDashboard = await DashboardItems.editDashboardItem(
      dashboardObjPrev._id,
      { name: 'updatedDashboard' }
    );

    expect(updatedDashboard.name).toBe('updatedDashboard');
  });

  test('Delete dashboard', async () => {
    const dashboardObjPrev = await DashboardItems.addDashboardItem({
      name: 'dashboard',
      dashboardId: 'dashboardId',
      layout: 'layout',
      vizState: 'vizState',
      type: 'type'
    });

    await DashboardItems.removeDashboardItem(dashboardObjPrev._id);

    const dashboardCount = await DashboardItems.countDocuments();

    expect(dashboardCount).toBe(0);
  });
});
