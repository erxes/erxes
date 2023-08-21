import { gatherDescriptions } from '../../../utils';
import {
  checkPermission,
  putCreateLog,
  putDeleteLog,
  putUpdateLog
} from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import messageBroker from '../../../messageBroker';
import {
  IClassification,
  IClassificationDocument
} from '../../../models/definitions/classification';

const classificationMutations = {
  classificationsAdd: async (
    _root,
    { classifications }: { classifications: IClassification[] },
    { user, models, subdomain }: IContext
  ) => {
    const classification = await models.Classification.createClassifications(
      classifications
    );

    const logData = {
      type: 'classification',
      newData: classifications,
      object: classification,
      extraParams: { models }
    };

    const descriptions = await gatherDescriptions(logData);

    await putCreateLog(
      subdomain,
      messageBroker(),
      {
        ...logData,
        ...descriptions
      },
      user
    );

    return classification;
  },
  classificationAdd: async (
    _root,
    doc: IClassification,
    { user, models, subdomain }: IContext
  ) => {
    const classification = await models.Classification.createClassification(
      doc
    );

    const logData = {
      type: 'classification',
      newData: doc,
      object: classification,
      extraParams: { models }
    };

    const descriptions = await gatherDescriptions(logData);

    await putCreateLog(
      subdomain,
      messageBroker(),
      {
        ...logData,
        ...descriptions
      },
      user
    );

    return classification;
  },
  /**
   * Updates a contractType
   */

  classificationEdit: async (
    _root,
    { _id, ...doc }: IClassificationDocument,
    { models, user, subdomain }: IContext
  ) => {
    const classification = await models.Classification.getClassification(_id);
    const updated = await models.Classification.updateClassification(_id, doc);

    const logData = {
      type: 'classification',
      newData: doc,
      object: classification,
      extraParams: { models }
    };

    const descriptions = await gatherDescriptions(logData);

    await putUpdateLog(
      subdomain,
      messageBroker(),
      {
        ...logData,
        ...descriptions
      },
      user
    );

    return updated;
  },

  /**
   * Removes contractTypes
   */

  classificationRemove: async (
    _root,
    { classificationIds }: { classificationIds: string[] },
    { models, subdomain, user }: IContext
  ) => {
    // TODO: contracts check
    const classifications = await models.Classification.find({
      _id: { $in: classificationIds }
    }).lean();

    var contractList: string[] = [];

    classifications.forEach(mur => {
      mur.dtl.forEach(a => {
        contractList.push(a.contractId);
      });
    });

    const transactions = await models.Transactions.find({
      contractId: contractList,
      $or: classifications.map(mur => ({ payDate: { $gt: mur.invDate } }))
    });

    if (transactions.length > 0)
      throw new Error(
        "Don't delete classification if transaction exits after changed classification change action"
      );

    for await (let mur of classifications) {
      await models.Contracts.updateMany(
        { _id: mur.dtl?.map(a => a.contractId) },
        { $set: { classification: mur.classification } }
      );
    }

    await models.Classification.deleteMany({ _id: { $in: classificationIds } });

    for (const classification of classifications) {
      const descriptions = await gatherDescriptions({
        type: 'classification',
        object: classification,
        extraParams: { models }
      });

      await putDeleteLog(
        subdomain,
        messageBroker(),
        {
          type: 'classification',
          object: classification,
          extraParams: { models },
          ...descriptions
        },
        user
      );
    }

    return classificationIds;
  }
};

export default classificationMutations;
