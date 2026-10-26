import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { agentsSettingsSchema } from '@/agents/db/definitions/settings';
import { IAgentsSettingsDocument } from '@/agents/@types/settings';

export interface IAgentsSettingsUpdateInput {
  codeModeEnabled?: boolean;
  codeModeEnvironment?: string;
  approvalMode?: string;
}

export interface IAgentsSettingsModel extends Model<IAgentsSettingsDocument> {
  /**
   * Returns the tenant's settings document, creating it with schema
   * defaults on first read. Tenant isolation is handled by the
   * per-subdomain connection this model is registered on.
   */
  getSettings(): Promise<IAgentsSettingsDocument>;
  /**
   * Patches the provided fields (undefined fields are left untouched) and
   * returns the updated document, creating it if this is the first write.
   */
  updateSettings(
    input: IAgentsSettingsUpdateInput,
  ): Promise<IAgentsSettingsDocument>;
}

const SETTINGS_ID = '000000000000000000000001';

export const loadAgentsSettingsClass = (models: IModels) => {
  class AgentsSettings {
    public static async getSettings(): Promise<IAgentsSettingsDocument> {
      const existing = await models.AgentsSettings.findOne(
        {},
      ).lean<IAgentsSettingsDocument>();

      if (existing) {
        return existing;
      }

      const created = await models.AgentsSettings.findOneAndUpdate(
        { _id: SETTINGS_ID },
        {
          $setOnInsert: {
            codeModeEnabled: false,
            codeModeEnvironment: 'in-process',
            approvalMode: 'writes',
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).lean<IAgentsSettingsDocument>();

      if (!created) throw new Error('Agents settings not found');
      return created;
    }

    public static async updateSettings(
      input: IAgentsSettingsUpdateInput,
    ): Promise<IAgentsSettingsDocument> {
      const set: Record<string, unknown> = {};

      if (input.codeModeEnabled !== undefined) {
        set.codeModeEnabled = input.codeModeEnabled;
      }

      if (input.codeModeEnvironment !== undefined) {
        set.codeModeEnvironment = input.codeModeEnvironment;
      }

      if (input.approvalMode !== undefined) {
        set.approvalMode = input.approvalMode;
      }

      const settings = await models.AgentsSettings.getSettings();
      const doc = await models.AgentsSettings.findOneAndUpdate(
        { _id: settings._id },
        { $set: set },
        { new: true },
      ).lean<IAgentsSettingsDocument>();

      if (!doc) {
        throw new Error('Agents settings not found');
      }

      return doc;
    }
  }

  agentsSettingsSchema.loadClass(AgentsSettings);

  return agentsSettingsSchema;
};
