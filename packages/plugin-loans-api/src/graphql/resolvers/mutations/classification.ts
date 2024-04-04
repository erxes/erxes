import { IContext } from '../../../connectionResolver';
import { createLog, deleteLog, updateLog } from '../../../logUtils';
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

    await createLog(subdomain, user, logData);

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

    await createLog(subdomain, user, logData);

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

    await updateLog(subdomain, user, logData);

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
      const logData = {
        type: 'classification',
        object: classification,
        extraParams: { models }
      };

      await deleteLog(subdomain, user, logData);
    }

    return classificationIds;
  }
};

export default classificationMutations;
