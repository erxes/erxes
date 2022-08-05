import { Model, model } from 'mongoose';

import {
  dashboardItemSchema,
  dashboardSchema,
  IDashboard,
  IDashboardDocument,
  IDashboardItemDocument,
  IDashboardItemEdit,
  IDashboardItemInput
} from './definitions/dashboard';
import * as _ from 'underscore';
import { escapeRegExp } from '../../data/utils';

export interface IDashboardModel extends Model<IDashboardDocument> {
  getDashboard(_id: string): Promise<IDashboardDocument>;
  addDashboard(doc: IDashboard): Promise<IDashboardDocument>;
  editDashboard(_id: string, fields: IDashboard): Promise<IDashboardDocument>;
  removeDashboard(_id: string): void;
  validateUniqueness(selector: any, name: string): Promise<boolean>;
}
export interface IDashboardItemModel extends Model<IDashboardItemDocument> {
  addDashboardItem(doc: IDashboardItemInput): Promise<IDashboardItemDocument>;
  editDashboardItem(
    _id: string,
    fields: IDashboardItemEdit
  ): Promise<IDashboardItemDocument>;
  removeDashboardItem(_id: string): void;
}

const setRelatedIds = async (dashboard: IDashboardDocument) => {
  if (dashboard.parentId) {
    const parentDashboard = await Dashboards.findOne({
      _id: dashboard.parentId
    });

    if (parentDashboard) {
      let relatedIds: string[];

      relatedIds = dashboard.relatedIds || [];
      relatedIds.push(dashboard._id);

      relatedIds = _.union(relatedIds, parentDashboard.relatedIds || []);

      await Dashboards.updateOne(
        { _id: parentDashboard._id },
        { $set: { relatedIds } }
      );

      const updated = await Dashboards.findOne({ _id: dashboard.parentId });

      if (updated) {
        await setRelatedIds(updated);
      }
    }
  }
};

// remove related dashboards
const removeRelatedIds = async (dashboard: IDashboardDocument) => {
  const dashboards = await Dashboards.find({
    relatedIds: { $in: dashboard._id }
  });

  if (dashboards.length === 0) {
    return;
  }

  const relatedIds: string[] = dashboard.relatedIds || [];

  relatedIds.push(dashboard._id);

  const doc: Array<{
    updateOne: {
      filter: { _id: string };
      update: { $set: { relatedIds: string[] } };
    };
  }> = [];

  dashboards.forEach(async t => {
    const ids = (t.relatedIds || []).filter(id => !relatedIds.includes(id));

    doc.push({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { relatedIds: ids } }
      }
    });
  });

  await Dashboards.bulkWrite(doc);
};

export const loadDashBoardClass = () => {
  class Dashboard {
    public static async getDashboard(_id: string) {
      const dashboard = await Dashboards.findOne({ _id });

      if (!dashboard) {
        throw new Error('Dashboard not found');
      }

      return dashboard;
    }

    public static async validateUniqueness(
      selector: any,
      name: string
    ): Promise<boolean> {
      // required name
      if (!name) {
        return true;
      }

      // can't update name same time more than one dashboards.
      const count = await Dashboards.find(selector).countDocuments();

      if (selector && count > 1) {
        return false;
      }

      const obj = selector && (await Dashboards.findOne(selector));

      const filter: any = { name };

      if (obj) {
        filter._id = { $ne: obj._id };
      }

      const existing = await Dashboards.findOne(filter);

      if (existing) {
        return false;
      }

      return true;
    }

    static async getParentDashboard(doc: IDashboard) {
      return Dashboards.findOne({
        _id: doc.parentId
      }).lean();
    }

    public static async generateOrder(
      parentDashboard: IDashboardDocument,
      { name }: { name: string }
    ) {
      const order = `${name}`;

      if (!parentDashboard) {
        return order;
      }

      let parentOrder = parentDashboard.order;

      if (!parentOrder) {
        parentOrder = `${parentDashboard.name}`;

        await Dashboards.updateOne(
          {
            _id: parentDashboard._id
          },
          { $set: { order: parentOrder } }
        );
      }

      return `${parentOrder}/${order}`;
    }

    public static async addDashboard(doc: IDashboard) {
      const isUnique = await Dashboards.validateUniqueness(null, doc.name);

      if (!isUnique) {
        throw new Error('Dashboard duplicated');
      }

      const parentDashboard = await this.getParentDashboard(doc);

      // Generating order
      const order = await this.generateOrder(parentDashboard, doc);

      const dashboard = await Dashboards.create({
        ...doc,
        order,
        createdAt: new Date()
      });

      await setRelatedIds(dashboard);
      return dashboard;
    }

    public static async editDashboard(_id: string, doc: IDashboard) {
      const isUnique = await Dashboards.validateUniqueness({ _id }, doc.name);

      if (!isUnique) {
        throw new Error('Dashboard duplicated');
      }

      const parentDashboard = await this.getParentDashboard(doc);

      if (parentDashboard && parentDashboard.parentId === _id) {
        throw new Error('Cannot change dashboard');
      }

      // Generating  order
      const order = await this.generateOrder(parentDashboard, doc);

      const dashboard = await Dashboards.findOne({
        _id
      });

      if (dashboard && dashboard.order) {
        const childDashboards = await Dashboards.find({
          $and: [
            {
              order: { $regex: new RegExp(escapeRegExp(dashboard.order), 'i') }
            },
            { _id: { $ne: _id } }
          ]
        });

        if (childDashboards.length > 0) {
          const bulkDoc: Array<{
            updateOne: {
              filter: { _id: string };
              update: { $set: { order: string } };
            };
          }> = [];

          // updating child categories order
          childDashboards.forEach(async childDashboard => {
            let childOrder = childDashboard.order;

            if (dashboard.order && childOrder) {
              childOrder = childOrder.replace(dashboard.order, order);

              bulkDoc.push({
                updateOne: {
                  filter: { _id: childDashboard._id },
                  update: { $set: { order: childOrder } }
                }
              });
            }
          });

          await Dashboards.bulkWrite(bulkDoc);

          await removeRelatedIds(dashboard);
        }
      }

      await Dashboards.updateOne({ _id }, { $set: { ...doc, order } });

      const updated = await Dashboards.findOne({ _id });

      if (updated) {
        await setRelatedIds(updated);
      }

      return updated;
    }

    public static async removeDashboard(_id: string) {
      const dashboard = await Dashboards.getDashboard(_id);
      const childCount = await Dashboards.countDocuments({ parentId: _id });

      if (childCount > 0) {
        throw new Error('Please remove child dashboards first');
      }

      await removeRelatedIds(dashboard);

      return Dashboards.deleteOne({ _id });
    }
  }

  dashboardSchema.loadClass(Dashboard);

  return dashboardSchema;
};

export const loadDashboardItemClass = () => {
  class DashboardItem {
    public static addDashboardItem(doc: IDashboardItemEdit) {
      return DashboardItems.create(doc);
    }

    public static async editDashboardItem(_id: string, feilds: IDashboard) {
      await DashboardItems.updateOne({ _id }, { $set: feilds });

      return DashboardItems.findOne({ _id });
    }

    public static async removeDashboardItem(_id: string) {
      await DashboardItems.deleteOne({ _id });
    }
  }

  dashboardItemSchema.loadClass(DashboardItem);

  return dashboardItemSchema;
};

loadDashBoardClass();
loadDashboardItemClass();

// tslint:disable-next-line
const Dashboards = model<IDashboardDocument, IDashboardModel>(
  'dashboards',
  dashboardSchema
);
// tslint:disable-next-line
const DashboardItems = model<IDashboardItemDocument, IDashboardItemModel>(
  'dashboard_items',
  dashboardItemSchema
);

export { DashboardItems, Dashboards };
