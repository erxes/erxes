import { IConformity, IConformityRelated } from './definitions/conformities';

export const getMatchConformities = ({
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

export const getSavedAnyConformityMatch = ({
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

export const conformityHelper = async ({
  doc,
  getConformities
}: {
  doc: any;
  getConformities(doc: any): Promise<IConformity[]>;
}) => {
  const conformities = await getConformities(doc);

  return conformities.map(item =>
    item.mainType === doc.mainType ? item.relTypeId : item.mainTypeId
  );
};

export const relatedConformityHelper = async ({
  doc,
  getSaved,
  getRelated
}: {
  doc: IConformityRelated;
  getSaved(doc: IConformityRelated): Promise<IConformity[]>;
  getRelated(
    doc: IConformityRelated,
    savedList: string[]
  ): Promise<IConformity[]>;
}) => {
  const savedRelatedObjects = await getSaved(doc);

  const savedList = savedRelatedObjects.map(item =>
    item.mainType === doc.mainType ? item.relTypeId : item.mainTypeId
  );

  const conformities = await getRelated(doc, savedList);

  return conformities.map(item =>
    item.mainType === doc.relType ? item.mainTypeId : item.relTypeId
  );
};
