import { Conformities } from '../../../db/models';

export const conformityFilterUtils = async (baseQuery, params, relType) => {
  if (params.conformityMainType && params.conformityMainTypeId) {
    if (params.conformityIsRelated) {
      const relTypeIds = await Conformities.relatedConformity({
        mainType: params.conformityMainType || '',
        mainTypeId: params.conformityMainTypeId || '',
        relType,
      });

      baseQuery = { _id: { $in: relTypeIds || [] } };
    }

    if (params.conformityIsSaved) {
      const relTypeIds = await Conformities.savedConformity({
        mainType: params.conformityMainType || '',
        mainTypeId: params.conformityMainTypeId || '',
        relType,
      });

      baseQuery = { _id: { $in: relTypeIds || [] } };
    }
  }
  return baseQuery;
};
