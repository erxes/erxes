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
    relatedContentType,
  }: {
    contentType: string;
    contentId: string;
    relatedContentType: string;
  }) => Promise<IRelationDocument[]>;
  getRelationsByEntities: ({
    contentType,
    contentId,
  }: {
    contentType: string;
    contentId: string;
  }) => Promise<IRelationDocument[]>;
  createMultipleRelations: ({
    relations,
  }: {
    relations: IRelation[];
  }) => Promise<IRelationDocument[]>;
}

export const loadRelationClass = (models: IModels) => {
  class Relation {
    public static async createRelation({ relation }: { relation: IRelation }) {
      return models.Relations.create(relation);
    }

    public static async createMultipleRelations({
      relations,
    }: {
      relations: IRelation[];
    }) {
      return models.Relations.insertMany(relations);
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
      relatedContentType,
    }: {
      contentType: string;
      contentId: string;
      relatedContentType: string;
    }) {
      const relation = await models.Relations.find({
        $and: [
          {
            entities: {
              $elemMatch: {
                contentType: contentType,
                contentId: contentId,
              },
            },
          },
          {
            entities: {
              $elemMatch: {
                contentType: relatedContentType,
              },
            },
          },
        ],
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
      return await models.Relations.find({
        'entities.contentType': { $in: [contentType] },
        'entities.contentId': { $in: [contentId] },
      }).lean();
    }
  }

  relationSchema.loadClass(Relation);

  return relationSchema;
};
