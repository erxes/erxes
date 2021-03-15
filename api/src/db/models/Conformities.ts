import { Model, model } from 'mongoose';
import {
  conformitySchema,
  IConformityAdd,
  IConformityChange,
  IConformityDocument,
  IConformityEdit,
  IConformityFilter,
  IConformityRelated,
  IConformityRemove,
  IConformitySaved
} from './definitions/conformities';

const getSavedAnyConformityMatch = ({
  mainType,
  mainTypeId
}: {
  mainType: string;
  mainTypeId: string;
}) => {
  return {
    $or: [
      {
        $and: [{ mainType }, { mainTypeId }]
      },
      {
        $and: [{ relType: mainType }, { relTypeId: mainTypeId }]
      }
    ]
  };
};

const getProjectCondition = (
  mainType: string,
  mainVar: string,
  relVar: string
) => {
  return {
    $cond: {
      if: { $eq: ['$mainType', mainType] },
      then: '$'.concat(relVar),
      else: '$'.concat(mainVar)
    }
  };
};

export interface IConformityModel extends Model<IConformityDocument> {
  addConformity(doc: IConformityAdd): Promise<IConformityDocument>;
  editConformity(doc: IConformityEdit): void;
  changeConformity(doc: IConformityChange): void;
  removeConformity(doc: IConformityRemove): void;
  savedConformity(doc: IConformitySaved): Promise<string[]>;
  relatedConformity(doc: IConformityRelated): Promise<string[]>;
  filterConformity(doc: IConformityFilter): Promise<string[]>;
  getConformities(doc: IConformityFilter): Promise<IConformityDocument[]>;
}

export const loadConformityClass = () => {
  class Conformity {
    /**
     * Create a conformity
     */
    public static addConformity(doc: IConformityAdd) {
      return Conformities.create(doc);
    }

    public static async editConformity(doc: IConformityEdit) {
      const newRelTypeIds = doc.relTypeIds || [];
      const oldRelTypeIds = await Conformity.savedConformity({
        mainType: doc.mainType,
        mainTypeId: doc.mainTypeId,
        relTypes: [doc.relType]
      });

      const removedTypeIds = oldRelTypeIds.filter(
        e => !newRelTypeIds.includes(e)
      );
      const addedTypeIds = newRelTypeIds.filter(
        e => !oldRelTypeIds.includes(e)
      );

      // insert on new relTypeIds
      const insertTypes = await addedTypeIds.map(relTypeId => ({
        mainType: doc.mainType,
        mainTypeId: doc.mainTypeId,
        relType: doc.relType,
        relTypeId
      }));
      await Conformities.insertMany(insertTypes);

      // delete on removedTypeIds
      await Conformities.deleteMany({
        $or: [
          {
            $and: [
              { mainType: doc.mainType },
              { mainTypeId: doc.mainTypeId },
              { relType: doc.relType },
              { relTypeId: { $in: removedTypeIds } }
            ]
          },
          {
            $and: [
              { mainType: doc.relType },
              { mainTypeId: { $in: removedTypeIds } },
              { relType: doc.mainType },
              { relTypeId: doc.mainTypeId }
            ]
          }
        ]
      });

      return;
    }

    public static async savedConformity(doc: IConformitySaved) {
      const relTypes = doc.relTypes || [];

      const relTypeIds = await Conformities.aggregate([
        {
          $match: {
            $or: [
              {
                $and: [
                  { mainType: doc.mainType },
                  { mainTypeId: doc.mainTypeId },
                  { relType: { $in: relTypes } }
                ]
              },
              {
                $and: [
                  { mainType: { $in: relTypes } },
                  { relType: doc.mainType },
                  { relTypeId: doc.mainTypeId }
                ]
              }
            ]
          }
        },
        {
          $project: {
            relTypeId: getProjectCondition(
              doc.mainType,
              'mainTypeId',
              'relTypeId'
            )
          }
        }
      ]);

      return relTypeIds.map(item => String(item.relTypeId));
    }

    public static async changeConformity(doc: IConformityChange) {
      await Conformities.updateMany(
        {
          $and: [
            { mainType: doc.type },
            { mainTypeId: { $in: doc.oldTypeIds } }
          ]
        },
        { $set: { mainTypeId: doc.newTypeId } }
      );

      await Conformities.updateMany(
        {
          $and: [{ relType: doc.type }, { relTypeId: { $in: doc.oldTypeIds } }]
        },
        { $set: { relTypeId: doc.newTypeId } }
      );
    }

    public static async filterConformity(doc: IConformityFilter) {
      const relTypeIds = await Conformities.aggregate([
        {
          $match: {
            $or: [
              {
                $and: [
                  { mainType: doc.mainType },
                  { mainTypeId: { $in: doc.mainTypeIds } },
                  { relType: doc.relType }
                ]
              },
              {
                $and: [
                  { mainType: doc.relType },
                  { relType: doc.mainType },
                  { relTypeId: { $in: doc.mainTypeIds } }
                ]
              }
            ]
          }
        },
        {
          $project: {
            relTypeId: getProjectCondition(
              doc.mainType,
              'mainTypeId',
              'relTypeId'
            )
          }
        }
      ]);

      return relTypeIds.map(item => String(item.relTypeId));
    }

    public static async getConformities(doc: IConformityFilter) {
      return Conformities.aggregate([
        {
          $match: {
            $or: [
              {
                $and: [
                  { mainType: doc.mainType },
                  { mainTypeId: { $in: doc.mainTypeIds } },
                  { relType: doc.relType }
                ]
              },
              {
                $and: [
                  { mainType: doc.relType },
                  { relType: doc.mainType },
                  { relTypeId: { $in: doc.mainTypeIds } }
                ]
              }
            ]
          }
        }
      ]);
    }

    public static async relatedConformity(doc: IConformityRelated) {
      const match = getSavedAnyConformityMatch({
        mainType: doc.mainType,
        mainTypeId: doc.mainTypeId
      });

      const savedRelatedObjects = await Conformities.aggregate([
        { $match: match },
        {
          $project: {
            savedRelType: getProjectCondition(
              doc.mainType,
              'mainType',
              'relType'
            ),
            savedRelTypeId: getProjectCondition(
              doc.mainType,
              'mainTypeId',
              'relTypeId'
            )
          }
        }
      ]);

      const savedList = savedRelatedObjects.map(
        item => item.savedRelType + '-' + item.savedRelTypeId
      );

      const relTypeIds = await Conformities.aggregate([
        {
          $project: {
            mainType: 1,
            mainTypeId: 1,
            relType: 1,
            relTypeId: 1,
            mainStr: { $concat: ['$mainType', '-', '$mainTypeId'] },
            relStr: { $concat: ['$relType', '-', '$relTypeId'] }
          }
        },
        {
          $match: {
            $or: [
              {
                $and: [
                  { mainType: doc.relType },
                  { relStr: { $in: savedList } }
                ]
              },
              {
                $and: [
                  { relType: doc.relType },
                  { mainStr: { $in: savedList } }
                ]
              }
            ]
          }
        },
        {
          $project: {
            relTypeId: getProjectCondition(
              doc.relType || '',
              'relTypeId',
              'mainTypeId'
            )
          }
        }
      ]);

      return relTypeIds.map(item => item.relTypeId);
    }

    /**
     * Remove conformity
     */
    public static async removeConformity(doc: IConformityRemove) {
      const match = getSavedAnyConformityMatch({
        mainType: doc.mainType,
        mainTypeId: doc.mainTypeId
      });

      await Conformities.deleteMany(match);
    }
  }

  conformitySchema.loadClass(Conformity);
  return conformitySchema;
};

loadConformityClass();

// tslint:disable-next-line
const Conformities = model<IConformityDocument, IConformityModel>(
  'conformity',
  conformitySchema
);

export default Conformities;
