import { automationVersionSchema } from '@/automations/db/definitions/automationVersion';
import {
  changedFlowNodeIds,
  flowContentHash,
  TAutomationFlow,
  TVersionMark,
} from '@/automations/utils/automationVersions';
import { Document, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

// Older versions than this are dropped as new ones are saved
export const AUTOMATION_VERSIONS_KEPT = 50;

export interface IAutomationVersion extends Required<TAutomationFlow> {
  automationId: string;
  version: number;
  contentHash: string;
  changedNodeIds: string[];
  note?: TAutomationVersionNote;
  createdBy?: string;
}

export interface IAutomationVersionDocument
  extends IAutomationVersion,
    Document {
  _id: string;
  createdAt: Date;
}

// What made a version; the UI words it
export type TAutomationVersionNote = 'created' | 'edited' | 'duplicated';

export type TAutomationVersionRecord = {
  automation: TAutomationFlow & { _id: string };
  userId?: string;
  note: TAutomationVersionNote;
};

export interface IAutomationVersionModel
  extends Model<IAutomationVersionDocument> {
  recordVersion(
    record: TAutomationVersionRecord,
  ): Promise<IAutomationVersionDocument | null>;
  listVersions(
    automationId: string,
    nodeId?: string,
  ): Promise<IAutomationVersionDocument[]>;
  getVersion(_id: string): Promise<IAutomationVersionDocument>;
  removeVersions(automationIds: string[]): Promise<void>;
  versionMarks(automationId: string): Promise<TVersionMark[]>;
}

const LISTING_PROJECTION = { triggers: 0, actions: 0, workflows: 0 };

export const loadAutomationVersionClass = (models: IModels) => {
  class AutomationVersion {
    /**
     * Keeps the saved flow as a new version when what it does changed. A save
     * that only moved nodes, or changed nothing, adds no version.
     */
    public static async recordVersion({
      automation,
      userId,
      note,
    }: TAutomationVersionRecord) {
      const flow = {
        triggers: automation.triggers || [],
        actions: automation.actions || [],
        workflows: automation.workflows || [],
      };
      const contentHash = flowContentHash(flow);
      const latest = await models.AutomationVersions.findOne({
        automationId: automation._id,
      })
        .sort({ version: -1 })
        .lean();

      if (latest?.contentHash === contentHash) {
        return null;
      }

      const version = (latest?.version || 0) + 1;
      const created = await models.AutomationVersions.create({
        automationId: automation._id,
        version,
        ...flow,
        contentHash,
        changedNodeIds: changedFlowNodeIds(latest, flow),
        note,
        createdBy: userId,
      });

      await models.AutomationVersions.deleteMany({
        automationId: automation._id,
        version: { $lte: version - AUTOMATION_VERSIONS_KEPT },
      });

      return created;
    }

    /** Newest first, without the flow itself; a node narrows it to its own. */
    public static async listVersions(automationId: string, nodeId?: string) {
      return models.AutomationVersions.find(
        { automationId, ...(nodeId && { changedNodeIds: nodeId }) },
        LISTING_PROJECTION,
      )
        .sort({ version: -1 })
        .lean();
    }

    public static async getVersion(_id: string) {
      const version = await models.AutomationVersions.findOne({ _id }).lean();

      if (!version) {
        throw new Error('Automation version not found');
      }

      return version;
    }

    /** When each kept version was saved, oldest first. */
    public static async versionMarks(automationId: string) {
      return models.AutomationVersions.find(
        { automationId },
        { version: 1, createdAt: 1 },
      )
        .sort({ version: 1 })
        .lean();
    }

    public static async removeVersions(automationIds: string[]) {
      await models.AutomationVersions.deleteMany({
        automationId: { $in: automationIds },
      });
    }
  }

  automationVersionSchema.loadClass(AutomationVersion);

  return automationVersionSchema;
};
