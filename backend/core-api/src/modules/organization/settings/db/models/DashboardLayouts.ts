import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  dashboardLayoutSchema,
  IDashboardLayoutDocument,
  IDashboardLayoutItem,
} from '@/organization/settings/db/definitions/dashboardLayouts';

export const DASHBOARD_GRID_COLUMNS = 12;
export const DASHBOARD_MAX_ITEMS = 40;
const DASHBOARD_MAX_ROWS = 200;

export interface IDashboardLayoutModel extends Model<IDashboardLayoutDocument> {
  getUserLayout(userId: string): Promise<IDashboardLayoutDocument | null>;
  saveUserLayout(
    userId: string,
    items: IDashboardLayoutItem[],
  ): Promise<IDashboardLayoutDocument>;
  resetUserLayout(userId: string): Promise<boolean>;
}

const isWholeNumberInRange = (value: number, min: number, max: number) =>
  Number.isInteger(value) && value >= min && value <= max;

const validateItems = (items: IDashboardLayoutItem[]) => {
  if (items.length > DASHBOARD_MAX_ITEMS) {
    throw new Error(`A dashboard holds at most ${DASHBOARD_MAX_ITEMS} widgets`);
  }

  const ids = new Set<string>();

  for (const item of items) {
    if (!item.id?.trim() || !item.type?.trim()) {
      throw new Error('Every dashboard widget needs an id and a type');
    }

    if (ids.has(item.id)) {
      throw new Error(`Dashboard widget id "${item.id}" is used twice`);
    }

    ids.add(item.id);

    const fitsGrid =
      isWholeNumberInRange(item.w, 1, DASHBOARD_GRID_COLUMNS) &&
      isWholeNumberInRange(item.x, 0, DASHBOARD_GRID_COLUMNS - item.w) &&
      isWholeNumberInRange(item.h, 1, DASHBOARD_MAX_ROWS) &&
      isWholeNumberInRange(item.y, 0, DASHBOARD_MAX_ROWS);

    if (!fitsGrid) {
      throw new Error(
        `Dashboard widget "${item.id}" does not fit the ${DASHBOARD_GRID_COLUMNS}-column grid`,
      );
    }
  }
};

export const loadDashboardLayoutClass = (models: IModels) => {
  class DashboardLayouts {
    public static async getUserLayout(userId: string) {
      return models.DashboardLayouts.findOne({ userId });
    }

    public static async saveUserLayout(
      userId: string,
      items: IDashboardLayoutItem[],
    ) {
      validateItems(items);

      return models.DashboardLayouts.findOneAndUpdate(
        { userId },
        { $set: { items } },
        { new: true, upsert: true },
      );
    }

    // No stored layout means the user sees the current default.
    public static async resetUserLayout(userId: string) {
      await models.DashboardLayouts.deleteOne({ userId });

      return true;
    }
  }

  dashboardLayoutSchema.loadClass(DashboardLayouts);

  return dashboardLayoutSchema;
};
