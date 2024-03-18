import { Model } from 'mongoose';
import { getCollection } from './utils';
import {
  IPipelineLabel,
  IPipelineLabelDocument,
  pipelineLabelSchema
} from './definitions/pipelineLabels';
import { IModels } from '../connectionResolver';

interface IFilter extends IPipelineLabel {
  _id?: any;
}

interface ILabelObjectParams {
  labelIds: string[];
  targetId: string;
  collection: any;
}

export interface IPipelineLabelModel extends Model<IPipelineLabelDocument> {
  getPipelineLabel(_id: string): Promise<IPipelineLabelDocument>;
  createPipelineLabel(doc: IPipelineLabel): Promise<IPipelineLabelDocument>;
  updatePipelineLabel(
    _id: string,
    doc: IPipelineLabel
  ): Promise<IPipelineLabelDocument>;
  removePipelineLabel(_id: string): void;
  labelsLabel(pipelineId: string, targetId: string, labelIds: string[]): void;
  validateUniqueness(filter: IFilter, _id?: string): Promise<boolean>;
  labelObject(params: ILabelObjectParams): void;
}

export const loadPipelineLabelClass = (models: IModels) => {
  class PipelineLabel {
    public static async getPipelineLabel(_id: string) {
      const pipelineLabel = await models.PipelineLabels.findOne({ _id });

      if (!pipelineLabel) {
        throw new Error('Label not found');
      }

      return pipelineLabel;
    }
    /*
     * Validates label uniquness
     */
    public static async validateUniqueness(
      filter: IFilter,
      _id?: string
    ): Promise<boolean> {
      if (_id) {
        filter._id = { $ne: _id };
      }

      if (await models.PipelineLabels.findOne(filter)) {
        return false;
      }

      return true;
    }

    /*
     * Common helper for objects like deal, purchase ,task, ticket and growth hack etc ...
     */

    public static async labelObject({
      labelIds,
      targetId,
      collection
    }: ILabelObjectParams) {
      const prevLabelsCount = await models.PipelineLabels.find({
        _id: { $in: labelIds }
      }).count();

      if (prevLabelsCount !== labelIds.length) {
        throw new Error('Label not found');
      }

      await collection.updateMany(
        { _id: targetId },
        { $set: { labelIds } },
        { multi: true }
      );
    }

    /**
     * Create a pipeline label
     */
    public static async createPipelineLabel(doc: IPipelineLabel) {
      const filter: IFilter = {
        name: doc.name,
        pipelineId: doc.pipelineId,
        colorCode: doc.colorCode
      };

      const isUnique = await models.PipelineLabels.validateUniqueness(filter);

      if (!isUnique) {
        throw new Error('Label duplicated');
      }

      return models.PipelineLabels.create(doc);
    }

    /**
     * Update pipeline label
     */
    public static async updatePipelineLabel(_id: string, doc: IPipelineLabel) {
      const isUnique = await models.PipelineLabels.validateUniqueness(
        { ...doc },
        _id
      );

      if (!isUnique) {
        throw new Error('Label duplicated');
      }

      await models.PipelineLabels.updateOne({ _id }, { $set: doc });

      return models.PipelineLabels.findOne({ _id });
    }

    /**
     * Remove pipeline label
     */
    public static async removePipelineLabel(_id: string) {
      const pipelineLabel = await models.PipelineLabels.findOne({ _id });

      if (!pipelineLabel) {
        throw new Error('Label not found');
      }

      const pipeline = await models.Pipelines.getPipeline(
        pipelineLabel.pipelineId
      );

      const { collection } = getCollection(models, pipeline.type);

      // delete labelId from collection that used labelId
      await collection.updateMany(
        { labelIds: { $in: [pipelineLabel._id] } },
        { $pull: { labelIds: pipelineLabel._id } }
      );

      return models.PipelineLabels.deleteOne({ _id });
    }

    /**
     * Attach a label
     */
    public static async labelsLabel(
      pipelineId: string,
      targetId: string,
      labelIds: string[]
    ) {
      const pipeline = await models.Pipelines.getPipeline(pipelineId);

      const { collection } = getCollection(models, pipeline.type);

      await models.PipelineLabels.labelObject({
        labelIds,
        targetId,
        collection
      });
    }
  }

  pipelineLabelSchema.loadClass(PipelineLabel);

  return pipelineLabelSchema;
};
