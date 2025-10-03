import { IRelation, IRelationDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { relationSchema } from '@/relations/db/definitions/relations';

export interface IRelationModel extends Model<IRelationDocument> {
  createRelation: ({
    relation,
  }: {
    relation: IRelation;
  }) => Promise<IRelationDocument>;
  updateRelation: ({
    _id,
    doc,
  }: {
    _id: string;
    doc: IRelation;
  }) => Promise<IRelationDocument>;
  deleteRelation: ({ _id }: { _id: string }) => Promise<IRelationDocument>;
  getRelationsByEntity: ({
    contentType,
    contentId,
  }: {
    contentType: string;
    contentId: string;
  }) => Promise<IRelationDocument[]>;
  getRelationsByEntities: ({
    contentType,
    contentId,
  }: {
    contentType: string;
    contentId: string;
  }) => Promise<IRelationDocument[]>;
}

export const loadRelationClass = (models: IModels) => {
  class Relation {
    public static async createRelation({ relation }: { relation: IRelation }) {
      return models.Relations.create(relation);
    }

    public static async updateRelation({
      _id,
      doc,
    }: {
      _id: string;
      doc: IRelation;
    }) {
      return models.Relations.updateOne({ _id }, doc);
    }

    public static async deleteRelation({ _id }: { _id: string }) {
      return models.Relations.deleteOne({ _id });
    }

    public static async getRelationsByEntity({
      contentType,
      contentId,
    }: {
      contentType: string;
      contentId: string;
    }) {
      const relation = await models.Relations.find({
        'entities.contentType': contentType,
        'entities.contentId': contentId,
      });

      return relation;
    }

    public static async getRelationsByEntities({
      contentType,
      contentId,
    }: {
      contentType: string;
      contentId: string;
    }) {
      return models.Relations.find({
        'entities.contentType': { $in: contentType },
        'entities.contentId': { $in: contentId },
      });
    }
  }

  relationSchema.loadClass(Relation);

  return relationSchema;
};
