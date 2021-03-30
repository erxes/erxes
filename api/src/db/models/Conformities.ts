import { Model, model } from 'mongoose';
import { isUsingElk } from '../../data/utils';
import { fetchElk } from '../../elasticsearch';
import {
  conformitySchema,
  IConformitiesRemove,
  IConformity,
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

const getMatch = ({
  mainType,
  mainTypeIds,
  relTypes
}: {
  mainType: string;
  mainTypeIds: string[];
  relTypes: string[];
}) => {
  return {
    $match: {
      $or: [
        {
          $and: [
            { mainType },
            { mainTypeId: { $in: mainTypeIds } },
            { relType: { $in: relTypes } }
          ]
        },
        {
          $and: [
            { mainType: { $in: relTypes } },
            { relType: mainType },
            { relTypeId: { $in: mainTypeIds } }
          ]
        }
      ]
    }
  };
};

const getElasticQuery = ({
  mainType,
  mainTypeIds,
  relTypes
}: {
  mainType: string;
  mainTypeIds: string[];
  relTypes: string[];
}) => {
  return {
    bool: {
      should: [
        {
          bool: {
            must: [
              {
                match: {
                  mainType
                }
              },
              {
                terms: {
                  mainTypeId: mainTypeIds
                }
              },
              {
                terms: {
                  relType: relTypes
                }
              }
            ]
          }
        },
        {
          bool: {
            must: [
              {
                terms: {
                  mainType: relTypes
                }
              },
              {
                match: {
                  relType: mainType
                }
              },
              {
                terms: {
                  relTypeId: mainTypeIds
                }
              }
            ]
          }
        }
      ]
    }
  };
};

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

export interface IConformityModel extends Model<IConformityDocument> {
  addConformity(doc: IConformityAdd): Promise<IConformityDocument>;
  editConformity(
    doc: IConformityEdit
  ): Promise<{ addedTypeIds: string[]; removedTypeIds: string[] }>;
  changeConformity(doc: IConformityChange): void;
  removeConformity(doc: IConformityRemove): void;
  removeConformities(doc: IConformitiesRemove): void;
  savedConformity(doc: IConformitySaved, mustDB?: boolean): Promise<string[]>;
  relatedConformity(doc: IConformityRelated): Promise<string[]>;
  filterConformity(doc: IConformityFilter): Promise<string[]>;
  getConformities(doc: IGetConformityBulk): Promise<IConformityDocument[]>;
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
      const oldRelTypeIds = await this.savedConformity(
        {
          mainType: doc.mainType,
          mainTypeId: doc.mainTypeId,
          relTypes: [doc.relType]
        },
        true
      );

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

    public static async savedConformity(doc: IConformitySaved, mustDb = false) {
      let conformities: IConformity[] = [];

      if (mustDb || !isUsingElk()) {
        conformities = await Conformities.aggregate([
          {
            ...getMatch({
              mainType: doc.mainType,
              relTypes: doc.relTypes,
              mainTypeIds: [doc.mainTypeId]
            })
          }
        ]);
      } else {
        const response = await fetchElk(
          'search',
          'conformities',
          {
            query: {
              ...getElasticQuery({
                mainType: doc.mainType,
                relTypes: doc.relTypes,
                mainTypeIds: [doc.mainTypeId]
              })
            }
          },
          '',
          { hits: { hits: [] } }
        );

        conformities = response.hits.hits.map(hit => {
          return {
            _id: hit._id,
            ...hit._source
          };
        });
      }

      return conformities.map(item => {
        return item.mainType === doc.mainType
          ? String(item.relTypeId)
          : String(item.mainTypeId);
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
      let conformities: IConformity[] = [];

      if (!isUsingElk()) {
        conformities = await Conformities.aggregate([
          {
            ...getMatch({
              mainType: doc.mainType,
              relTypes: [doc.relType],
              mainTypeIds: doc.mainTypeIds
            })
          }
        ]);
      } else {
        const response = await fetchElk(
          'search',
          'conformities',
          {
            query: {
              ...getElasticQuery({
                mainType: doc.mainType,
                relTypes: [doc.relType],
                mainTypeIds: doc.mainTypeIds
              })
            }
          },
          '',
          { hits: { hits: [] } }
        );

        conformities = response.hits.hits.map(hit => {
          return {
            _id: hit._id,
            ...hit._source
          };
        });
      }

      return conformities.map(item => {
        return item.mainType === doc.mainType
          ? String(item.relTypeId)
          : String(item.mainTypeId);
      });
    }

    public static async getConformities(doc: IGetConformityBulk) {
      if (!isUsingElk()) {
        return Conformities.aggregate([
          {
            ...getMatch({ ...doc })
          }
        ]);
      }

      const response = await fetchElk(
        'search',
        'conformities',
        {
          query: {
            ...getElasticQuery({ ...doc })
          }
        },
        '',
        { hits: { hits: [] } }
      );

      return response.hits.hits.map(hit => {
        return {
          _id: hit._id,
          ...hit._source
        };
      });
    }

    public static async relatedConformity(doc: IConformityRelated) {
      const match = getSavedAnyConformityMatch({
        mainType: doc.mainType,
        mainTypeId: doc.mainTypeId
      });

      let savedRelatedObjects: IConformity[] = [];
      if (!isUsingElk()) {
        savedRelatedObjects = await Conformities.aggregate([{ $match: match }]);
      } else {
        const response = await fetchElk(
          'search',
          'conformities',
          {
            query: {
              bool: {
                should: [
                  {
                    bool: {
                      must: [
                        {
                          match: {
                            mainType: doc.mainType
                          }
                        },
                        {
                          match: {
                            mainTypeId: doc.mainTypeId
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
                            relType: doc.mainType
                          }
                        },
                        {
                          match: {
                            relTypeId: doc.mainTypeId
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          },
          '',
          { hits: { hits: [] } }
        );

        savedRelatedObjects = response.hits.hits.map(hit => {
          return {
            _id: hit._id,
            ...hit._source
          };
        });
      }

      const savedList = savedRelatedObjects.map(item => {
        return item.mainType === doc.mainType
          ? String(item.relTypeId)
          : String(item.mainTypeId);
      });

      let conformities: IConformity[] = [];
      if (!isUsingElk()) {
        conformities = await Conformities.aggregate([
          {
            $match: {
              $or: [
                {
                  $and: [
                    { mainType: doc.relType },
                    { relTypeId: { $in: savedList } }
                  ]
                },
                {
                  $and: [
                    { relType: doc.relType },
                    { mainTypeId: { $in: savedList } }
                  ]
                }
              ]
            }
          }
        ]);
      } else {
        const response = await fetchElk(
          'search',
          'conformities',
          {
            query: {
              bool: {
                should: [
                  {
                    bool: {
                      must: [
                        {
                          match: {
                            mainType: doc.relType
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
                            relType: doc.relType
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
            }
          },
          '',
          { hits: { hits: [] } }
        );

        conformities = response.hits.hits.map(hit => {
          return {
            _id: hit._id,
            ...hit._source
          };
        });
      }

      return conformities.map(item => {
        return item.mainType === doc.relType ? item.mainTypeId : item.relTypeId;
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
