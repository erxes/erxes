import { dashboardFactory } from '../db/factories';
import { DashboardItems, Dashboards } from '../db/models';

import './setup.ts';

describe('Dashboards db', () => {
  let _dashboard;
  let _dashboard2;

  beforeEach(async () => {
    // Creating test data
    _dashboard = await dashboardFactory({});
    _dashboard2 = await dashboardFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Dashboards.deleteMany({});
    await DashboardItems.deleteMany({});
  });

  test('Get dashboard', async () => {
    try {
      await Dashboards.getDashboard('fakeId');
    } catch (e) {
      expect(e.message).toBe('Dashboard not found');
    }

    const response = await Dashboards.getDashboard(_dashboard._id);

    expect(response).toBeDefined();
  });

  test('Validate unique dashboard', async () => {
    const empty = await Dashboards.validateUniqueness({}, '');

    const selectDashboard = await Dashboards.validateUniqueness(
      {},
      'new dashboard'
    );

    const existing = await Dashboards.validateUniqueness({}, _dashboard.name);

    expect(empty).toEqual(true);
    expect(selectDashboard).toEqual(false);
    expect(existing).toEqual(false);
  });

  test('Create dashboard check duplicated', async () => {
    expect.assertions(1);
    try {
      await Dashboards.addDashboard(_dashboard2);
    } catch (e) {
      expect(e.message).toEqual('Dashboard duplicated');
    }
  });

  test('Update dashboard check duplicated', async () => {
    expect.assertions(2);
    try {
      await Dashboards.editDashboard(_dashboard2._id, {
        name: _dashboard.name,
        visibility: 'public'
      });
    } catch (e) {
      expect(e.message).toEqual('Dashboard duplicated');
    }

    try {
      const childDashboard = await dashboardFactory({
        parentId: _dashboard2._id
      });

      await Dashboards.editDashboard(_dashboard2._id, {
        name: 'child dashboard',
        parentId: childDashboard._id,
        visibility: 'public'
      });
    } catch (e) {
      expect(e.message).toEqual('Cannot change dashboard');
    }
  });

  test('Add dashboard', async () => {
    const dashboardObj = await Dashboards.addDashboard({
      name: `${_dashboard.name}1`,
      visibility: 'public'
    });

    expect(dashboardObj).toBeDefined();
    expect(dashboardObj.name).toBe(`${_dashboard.name}1`);
    expect(dashboardObj.order).toEqual(`${_dashboard.name}1`);
  });

  test('Update dashboard', async () => {
    const dashboardObjPrev = await Dashboards.editDashboard(_dashboard._id, {
      name: _dashboard.name,
      visibility: 'public'
    });

    expect(dashboardObjPrev).toBeDefined();
    expect(dashboardObjPrev.name).toEqual(_dashboard.name);

    const dashboard2 = await Dashboards.addDashboard({
      name: 'sub dashboard',
      parentId: dashboardObjPrev._id,
      visibility: 'public'
    });

    let parentDashboard = await Dashboards.findOne({
      _id: dashboardObjPrev._id
    }).lean();

    expect(dashboard2.order).toEqual(`${dashboardObjPrev.order}/sub dashboard`);
    expect(parentDashboard.relatedIds).toEqual([dashboard2._id]);

    const dashboard3 = await Dashboards.addDashboard({
      name: 'sub dashboard 2',
      parentId: dashboard2._id,
      visibility: 'public'
    });

    expect(dashboard3.order).toEqual(`${dashboard2.order}/sub dashboard 2`);

    const updatedDashboard2 = await Dashboards.findOne({
      _id: dashboard2._id
    }).lean();
    expect(updatedDashboard2.relatedIds).toEqual([dashboard3._id]);

    parentDashboard = await Dashboards.findOne({
      _id: dashboardObjPrev._id
    }).lean();
    expect(parentDashboard.relatedIds).toEqual([
      dashboard3._id,
      dashboard2._id
    ]);

    const newDashboard = await dashboardFactory({});

    await Dashboards.editDashboard(dashboard2._id, {
      name: 'change parent dashboard',
      parentId: newDashboard._id,
      visibility: 'public'
    });

    parentDashboard = await Dashboards.findOne({
      _id: dashboardObjPrev._id
    }).lean();
    expect(parentDashboard.relatedIds.length).toEqual(0);
  });

  test('Delete dashboard', async () => {
    const dashboardObjPrev = await Dashboards.addDashboard({
      name: 'dashboard',
      visibility: 'public'
    });
    await Dashboards.removeDashboard(dashboardObjPrev._id);

    const dashboardCount = await Dashboards.countDocuments();

    expect(dashboardCount).toBe(2);

    const parentId = _dashboard._id;

    const newDashboard = await Dashboards.addDashboard({
      name: 'new',
      parentId,
      visibility: 'public'
    });

    let parentDashboard = await Dashboards.findOne({ _id: parentId }).lean();

    expect(parentDashboard.relatedIds.length).toEqual(1);
    expect(parentDashboard.relatedIds).toEqual([newDashboard._id]);

    const isDeleted = await Dashboards.removeDashboard(newDashboard.id);
    parentDashboard = await Dashboards.findOne({ _id: parentId }).lean();

    expect(isDeleted).toBeTruthy();
    expect(parentDashboard.relatedIds.length).toEqual(0);

    const empty = await Dashboards.removeDashboard(parentId);
    expect(empty).toBeTruthy();
  });

  test('Delete dashboard with child', async () => {
    expect.assertions(1);

    try {
      await Dashboards.addDashboard({
        name: 'child dashboard',
        parentId: _dashboard._id,
        visibility: 'public'
      });

      await Dashboards.removeDashboard(_dashboard._id);
    } catch (e) {
      expect(e.message).toEqual('Please remove child dashboards first');
    }
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
