import { Model } from 'mongoose';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { toolSchema } from '@/tool/db/definitions/tool';
import { IMastraTool, IMastraToolDocument } from '@/tool/@types/tool';

export interface IMastraToolListParams {
  page?: number;
  perPage?: number;
  searchValue?: string;
  type?: string;
}

export interface IMastraToolListResult {
  list: IMastraToolDocument[];
  totalCount: number;
}

export interface IMastraToolModel extends Model<IMastraToolDocument> {
  getTool(_id: string): Promise<IMastraToolDocument>;
  getTools(): Promise<IMastraToolDocument[]>;
  getToolsList(params: IMastraToolListParams): Promise<IMastraToolListResult>;
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

    // Offset-paginated list for the Tools settings table (scroll-triggered
    // "load more" on the frontend). Newest first; supports a free-text search
    // across name / id / description / operation / plugin, and a type filter.
    public static async getToolsList({
      page = 1,
      perPage = 30,
      searchValue,
      type,
    }: IMastraToolListParams) {
      const filter: Record<string, any> = {};

      if (type) filter.type = type;

      if (searchValue) {
        const re = new RegExp(escapeRegExp(searchValue), 'i');
        filter.$or = [
          { name: re },
          { toolId: re },
          { description: re },
          { erxesOperation: re },
          { erxesPlugin: re },
          { erxesModule: re },
        ];
      }

      const limit = Math.min(Math.max(perPage, 1), 100);
      const skip = (Math.max(page, 1) - 1) * limit;

      const [list, totalCount] = await Promise.all([
        _models.MastraTool.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        _models.MastraTool.countDocuments(filter),
      ]);

      return { list, totalCount };
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
