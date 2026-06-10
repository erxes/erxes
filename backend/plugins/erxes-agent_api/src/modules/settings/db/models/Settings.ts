import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { settingsSchema } from '@/settings/db/definitions/settings';
import { IKnowledgeSyncStatus, IMastraSettings, IMastraSettingsDocument } from '@/settings/@types/settings';

export interface IMastraSettingsModel extends Model<IMastraSettingsDocument> {
  getSettings(): Promise<IMastraSettingsDocument>;
  saveSettings(doc: IMastraSettings): Promise<IMastraSettingsDocument>;
  saveKnowledgeSyncStatus(status: IKnowledgeSyncStatus): Promise<void>;
}

export const loadSettingsClass = (_models: IModels) => {
  class MastraSettings {
    public static async getSettings() {
      let doc = await _models.MastraSettings.findOne({});
      if (!doc) {
        doc = await _models.MastraSettings.create({
          erxesApiUrl: process.env.ERXES_AGENT_ERXES_API_URL || 'http://localhost:4000',
          erxesApiToken: process.env.ERXES_AGENT_ERXES_API_TOKEN,
          defaultAgentId: process.env.ERXES_AGENT_DEFAULT_AGENT_ID,
        });
      }

      // Env vars override DB values at runtime (DB is not modified)
      if (process.env.ERXES_AGENT_ERXES_API_URL) doc.erxesApiUrl = process.env.ERXES_AGENT_ERXES_API_URL;
      if (process.env.ERXES_AGENT_ERXES_API_TOKEN) doc.erxesApiToken = process.env.ERXES_AGENT_ERXES_API_TOKEN;
      if (process.env.ERXES_AGENT_DEFAULT_AGENT_ID) doc.defaultAgentId = process.env.ERXES_AGENT_DEFAULT_AGENT_ID;
      if (process.env.BRAVE_SEARCH_API_KEY) doc.searchApiKey = process.env.BRAVE_SEARCH_API_KEY;

      return doc;
    }

    public static async saveSettings(doc: IMastraSettings) {
      const existing = await _models.MastraSettings.findOne({});
      if (existing) {
        return _models.MastraSettings.findOneAndUpdate(
          { _id: existing._id },
          { $set: doc },
          { new: true },
        );
      }
      return _models.MastraSettings.create(doc);
    }

    // Sweep status only — kept separate from saveSettings so the background
    // worker can never clobber user-edited settings fields.
    public static async saveKnowledgeSyncStatus(status: IKnowledgeSyncStatus) {
      const existing = await _models.MastraSettings.getSettings();
      await _models.MastraSettings.updateOne(
        { _id: existing._id },
        { $set: { knowledgeSyncStatus: status } },
      );
    }
  }

  settingsSchema.loadClass(MastraSettings);
  return settingsSchema;
};
