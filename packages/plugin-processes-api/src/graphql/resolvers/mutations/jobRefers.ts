import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';

import { IJobRefer, IJobReferDocument } from '../../../models/definitions/jobs';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { IJobCategory } from '../../../models/definitions/jobCategories';

interface IJobRefersEdit extends IJobRefer {
  _id: string;
}

const jobReferMutations = {
  /**
   * Creates a new jobRefer
   * @param {Object} doc Product document
   */
  async jobRefersAdd(
    _root,
    doc: IJobRefer,
    { user, docModifier, models, subdomain }: IContext
  ) {
    console.log('jobRefers doc: ', doc);

    const jobRefer = await models.JobRefers.createJobRefer(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT,
        newData: {
          ...doc,
          categoryId: jobRefer.categoryId
        },
        object: jobRefer
      },
      user
    );

    return jobRefer;
  },

  /**
   * Edits a jobRefer
   * @param {string} param2._id Product id
   * @param {Object} param2.doc Product info
   */
  async jobRefersEdit(
    _root,
    { _id, ...doc }: IJobRefersEdit,
    { user, models, subdomain }: IContext
  ) {
    const jobRefer = await models.JobRefers.getJobRefer(_id);
    const updated = await models.JobRefers.updateJobRefer(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT,
        object: jobRefer,
        newData: { ...doc },
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Removes a jobRefer
   * @param {string} param1._id Product id
   */
  async jobRefersRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const jobRefer = await models.JobRefers.getJobRefer(_id);

    const response = await models.JobRefers.removeJobRefer(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.PRODUCT, object: jobRefer },
      user
    );

    return response;
  }
};

// moduleCheckPermission(jobReferMutations, 'manageJobRefers');

export default jobReferMutations;
