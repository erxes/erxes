import { Model, model } from 'mongoose';
import { isUsingElk } from '../../data/utils';
import {
  conformityHelper,
  findElk,
  getMatchConformities,
  getQueryConformities,
  getSavedAnyConformityMatch,
  getSavedAnyConformityQuery,
  relatedConformityHelper
} from './conformitiesUtils';
import {
  conformitySchema,
  IConformitiesRemove,
  IConformityAdd,
  IConformityChange,
  IConformityDocument,
  IConformityEdit,
  IConformityFilter,
  IConformityRelated,
  IConformityRemove,
  IConformitySaved,
  IGetConformityBulk
} from './definitions/conformities';

export interface IConformityModel extends Model<IConformityDocument> {
  addConformity(doc: IConformityAdd): Promise<IConformityDocument>;
  addConformities(docs: IConformityAdd[]): Promise<any>;
  editConformity(
    doc: IConformityEdit
  ): Promise<{ addedTypeIds: string[]; removedTypeIds: string[] }>;
  changeConformity(doc: IConformityChange): void;
  removeConformity(doc: IConformityRemove): void;
  removeConformities(doc: IConformitiesRemove): void;
  savedConformity(doc: IConformitySaved): Promise<string[]>;
  relatedConformity(doc: IConformityRelated): Promise<string[]>;
  filterConformity(doc: IConformityFilter): Promise<string[]>;
  getConformities(doc: IGetConformityBulk): Promise<IConformityDocument[]>;
}

export const loadConformityClass = () => {
  class Conformity {
    /**
     * Create a conformity
     */
    public static async addConformity(doc: IConformityAdd) {
      let conformity = await Conformities.findOne(doc);

      if (!conformity) {
        conformity = await Conformities.create(doc);
      }

      return conformity;
    }

    public static async addConformities(docs: IConformityAdd[]) {
      const result = await Conformities.insertMany(docs, {
        ordered: false,
        rawResult: false
      });
      return result;
    }

    public static async editConformity(doc: IConformityEdit) {
      const newRelTypeIds = doc.relTypeIds || [];
      const oldRelTypeIds = await conformityHelper({
        doc,
        getConformities: async () => {
          return Conformities.aggregate([
            {
              ...getMatchConformities({
                mainType: doc.mainType,
                relTypes: [doc.relType],
                mainTypeIds: [doc.mainTypeId]
              })
            }
          ]);
        }
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

      return { addedTypeIds, removedTypeIds };
    }

    public static async savedConformity(doc: IConformitySaved) {
      if (!isUsingElk()) {
        return conformityHelper({
          doc,
          getConformities: async () => {
            return Conformities.aggregate([
              {
                ...getMatchConformities({
                  mainType: doc.mainType,
                  relTypes: doc.relTypes,
                  mainTypeIds: [doc.mainTypeId]
                })
              }
            ]);
          }
        });
      }

      return conformityHelper({
        doc,
        getConformities: async () => {
          return findElk({
            ...getQueryConformities({
              mainType: doc.mainType,
              relTypes: doc.relTypes,
              mainTypeIds: [doc.mainTypeId]
            })
          });
        }
      });
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
      if (isUsingElk()) {
        return conformityHelper({
          doc,
          getConformities: async data => {
            return findElk({
              ...getQueryConformities({
                mainType: data.mainType,
                relTypes: [data.relType],
                mainTypeIds: data.mainTypeIds
              })
            });
          }
        });
      }

      return conformityHelper({
        doc,
        getConformities: async data => {
          return Conformities.aggregate([
            {
              ...getMatchConformities({
                mainType: data.mainType,
                relTypes: [data.relType],
                mainTypeIds: data.mainTypeIds
              })
            }
          ]);
        }
      });
    }

    public static async getConformities(doc: IGetConformityBulk) {
      if (isUsingElk()) {
        return findElk({ ...getQueryConformities({ ...doc }) });
      }

      return Conformities.aggregate([
        {
          ...getMatchConformities({ ...doc })
        }
      ]);
    }

    public static async relatedConformity(doc: IConformityRelated) {
      if (!isUsingElk()) {
        return relatedConformityHelper({
          doc,
          getSaved: async data => {
            return Conformities.aggregate([
              {
                $match: getSavedAnyConformityMatch({
                  mainType: data.mainType,
                  mainTypeId: data.mainTypeId
                })
              }
            ]);
          },
          getRelated: async (data, savedList) => {
            return Conformities.aggregate([
              {
                $match: {
                  $or: [
                    {
                      $and: [
                        { mainType: data.relType },
                        { relTypeId: { $in: savedList } }
                      ]
                    },
                    {
                      $and: [
                        { relType: data.relType },
                        { mainTypeId: { $in: savedList } }
                      ]
                    }
                  ]
                }
              }
            ]);
          }
        });
      }

      return relatedConformityHelper({
        doc,
        getSaved: async data => {
          return findElk({
            ...getSavedAnyConformityQuery({
              mainType: data.mainType,
              mainTypeId: data.mainTypeId
            })
          });
        },
        getRelated: async (data, savedList) => {
          return findElk({
            bool: {
              should: [
                {
                  bool: {
                    must: [
                      {
                        match: {
                          mainType: data.relType
                        }
                      },
                      {
                        terms: {
                          relTypeId: savedList
                        }
                      }
                    ]
                  }
                },
                {
                  bool: {
                    must: [
                      {
                        match: {
                          relType: data.relType
                        }
                      },
                      {
                        terms: {
                          mainTypeId: savedList
                        }
                      }
                    ]
                  }
                }
              ]
            }
          });
        }
      });
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

    /**
     * Remove conformities
     */
    public static async removeConformities(doc: IConformitiesRemove) {
      await Conformities.deleteMany({
        $or: [
          {
            $and: [
              { mainType: doc.mainType },
              { mainTypeId: { $in: doc.mainTypeIds } }
            ]
          },
          {
            $and: [
              { relType: doc.mainType },
              { relTypeId: { $in: doc.mainTypeIds } }
            ]
          }
        ]
      });
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
