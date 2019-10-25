import { Model, model } from 'mongoose';
import { GrowthHacks, Tasks } from '.';
import Deals from './Deals';
import { BOARD_TYPES } from './definitions/constants';
import { IPipelineLabel, IPipelineLabelDocument, pipelineLabelSchema } from './definitions/pipelineLabels';
import Tickets from './Tickets';

interface IFilter extends IPipelineLabel {
  _id?: any;
}

interface ILabelObjectParams {
  labelIds: string[];
  targetId: string;
  collection: any;
  type: string;
}

export interface IPipelineLabelModel extends Model<IPipelineLabelDocument> {
  createPipelineLabel(doc: IPipelineLabel): Promise<IPipelineLabelDocument>;
  updatePipelineLabel(_id: string, doc: IPipelineLabel): Promise<IPipelineLabelDocument>;
  removePipelineLabel(_id: string): void;
  labelsLabel(type: string, targetId: string, labelIds: string[]): void;
  validateUniqueness(filter: IFilter, _id?: string): Promise<boolean>;
  labelObject(params: ILabelObjectParams): void;
  getCollection(type: string): any;
}

export const loadPipelineLabelClass = () => {
  class PipelineLabel {
    /*
     * Validates label uniquness
     */
    public static async validateUniqueness(filter: IFilter, _id?: string): Promise<boolean> {
      if (_id) {
        filter._id = { $ne: _id };
      }

      if (await PipelineLabels.findOne(filter)) {
        return false;
      }

      return true;
    }

    /*
     * Common helper for objects like deal, task, ticket and growth hack etc ...
     */

    public static async labelObject({ labelIds, targetId, collection, type }: ILabelObjectParams) {
      const prevLabelsCount = await PipelineLabels.find({
        _id: { $in: labelIds },
        type,
      }).countDocuments();

      if (prevLabelsCount !== labelIds.length) {
        throw new Error('Label not found.');
      }

      await collection.updateMany({ _id: targetId }, { $set: { labelIds } }, { multi: true });
    }

    public static getCollection(type: string) {
      let collection;

      switch (type) {
        case BOARD_TYPES.DEAL: {
          collection = Deals;

          break;
        }
        case BOARD_TYPES.GROWTH_HACK: {
          collection = GrowthHacks;

          break;
        }
        case BOARD_TYPES.TASK: {
          collection = Tasks;

          break;
        }
        case BOARD_TYPES.TICKET: {
          collection = Tickets;

          break;
        }
      }

      return collection;
    }

    /**
     * Create a pipeline label
     */
    public static async createPipelineLabel(doc: IPipelineLabel) {
      const filter: IFilter = {
        name: doc.name,
        type: doc.type,
        pipelineId: doc.pipelineId,
        colorCode: doc.colorCode,
      };

      const isUnique = await PipelineLabels.validateUniqueness(filter);

      if (!isUnique) {
        throw new Error('Label duplicated');
      }

      return PipelineLabels.create(doc);
    }

    /**
     * Update pipeline label
     */
    public static async updatePipelineLabel(_id: string, doc: IPipelineLabel) {
      const isUnique = await PipelineLabels.validateUniqueness({ ...doc }, _id);

      if (!isUnique) {
        throw new Error('Label duplicated');
      }

      await PipelineLabels.updateOne({ _id }, { $set: doc });

      return PipelineLabels.findOne({ _id });
    }

    /**
     * Remove pipeline label
     */
    public static async removePipelineLabel(_id: string) {
      const pipelineLabel = await PipelineLabels.findOne({ _id });

      if (!pipelineLabel) {
        throw new Error('Label not found');
      }

      const collection = PipelineLabels.getCollection(pipelineLabel.type);

      // delete labelId from collection that used labelId
      await collection.updateMany(
        { labelIds: { $in: [pipelineLabel._id] } },
        { $pull: { labelIds: pipelineLabel._id } },
      );

      return PipelineLabels.deleteOne({ _id });
    }

    /**
     * Attach a label
     */
    public static async labelsLabel(type: string, targetId: string, labelIds: string[]) {
      const collection = PipelineLabels.getCollection(type);

      await PipelineLabels.labelObject({
        labelIds,
        targetId,
        collection,
        type,
      });
    }
  }

  pipelineLabelSchema.loadClass(PipelineLabel);

  return pipelineLabelSchema;
};

loadPipelineLabelClass();

// tslint:disable-next-line
const PipelineLabels = model<IPipelineLabelDocument, IPipelineLabelModel>('pipeline_labels', pipelineLabelSchema);

export default PipelineLabels;
