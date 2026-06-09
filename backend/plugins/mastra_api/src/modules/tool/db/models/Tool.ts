import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { toolSchema } from '@/tool/db/definitions/tool';
import { IMastraTool, IMastraToolDocument } from '@/tool/@types/tool';

export interface IMastraToolModel extends Model<IMastraToolDocument> {
  getTool(_id: string): Promise<IMastraToolDocument>;
  getTools(): Promise<IMastraToolDocument[]>;
  createTool(doc: IMastraTool): Promise<IMastraToolDocument>;
  updateTool(_id: string, doc: Partial<IMastraTool>): Promise<IMastraToolDocument>;
  removeTool(_id: string): Promise<{ ok: number }>;
}

export const loadToolClass = (_models: IModels) => {
  class MastraTool {
    public static async getTool(_id: string) {
      const tool = await _models.MastraTool.findOne({ _id });
      if (!tool) throw new Error('Tool not found');
      return tool;
    }

    public static async getTools() {
      return _models.MastraTool.find().sort({ createdAt: -1 });
    }

    public static async createTool(doc: IMastraTool) {
      // toolId is unique — surface a clear, actionable message instead of a raw
      // E11000 duplicate-key error (auto-create may have already added this op).
      const existing = await _models.MastraTool.findOne({ toolId: doc.toolId });
      if (existing) {
        throw new Error(
          `A tool for "${doc.toolId}" already exists. Open it from the Tools list to edit instead.`,
        );
      }
      return _models.MastraTool.create(doc);
    }

    public static async updateTool(_id: string, doc: Partial<IMastraTool>) {
      const updated = await _models.MastraTool.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true },
      );
      if (!updated) throw new Error('Tool not found');
      return updated;
    }

    public static async removeTool(_id: string) {
      return _models.MastraTool.deleteOne({ _id });
    }
  }

  toolSchema.loadClass(MastraTool);
  return toolSchema;
};
