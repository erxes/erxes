import { requireLogin } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { createLog, deleteLog, updateLog } from '../../../logUtils';
import {
  ICollateralType,
  ICollateralTypeDocument
} from '../../../models/definitions/collateralType';

const collateralTypeMutations = {
  collateralTypeAdd: async (
    _root,
    doc: ICollateralType,
    { user, models, subdomain }: IContext
  ) => {
    const collateralType =
      await models.CollateralTypes.createCollateralType(doc);

    const logData = {
      type: 'collateralType',
      newData: doc,
      object: collateralType,
      extraParams: { models }
    };

    await createLog(subdomain, user, logData);

    return collateralType;
  },
  collateralTypeEdit: async (
    _root,
    { _id, ...doc }: ICollateralTypeDocument,
    { user, models, subdomain }: IContext
  ) => {
    const collateralType = await models.CollateralTypes.findOne({ _id });

    const updatedCollateralType =
      await models.CollateralTypes.updateCollateralType(_id, doc);

    const logData = {
      type: 'collateralType',
      newData: doc,
      extraParams: { models },
      object: collateralType,
      updatedDocument: updatedCollateralType
    };

    await updateLog(subdomain, user, logData);

    return collateralType;
  },
  collateralTypeRemove: async (
    _root,
    { _id }: ICollateralTypeDocument,
    { user, models, subdomain }: IContext
  ) => {
    const collateralType = await models.CollateralTypes.findOne({ _id });

    if (collateralType) {
      await models.CollateralTypes.removeCollateralType(collateralType);
    } else {
      throw new Error('Collateral type not found.');
    }

    const logData = {
      type: 'collateralType',
      extraParams: { models },
      object: collateralType
    };

    await deleteLog(subdomain, user, logData);

    return collateralType;
  }
};

requireLogin(collateralTypeMutations, 'collateralTypeAdd');
requireLogin(collateralTypeMutations, 'collateralTypeEdit');

export default collateralTypeMutations;
