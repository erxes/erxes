// import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putUpdateLog,
  putDeleteLog,
  MODULE_NAMES
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { IWork } from '../../../models/definitions/works';

const workMutations = {
  /**
   * Creates a new flow
   * @param {Object} doc Product document
   */
  async workAdd(
    _root,
    doc: IWork,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const work = await models.Works.createWork({
      ...docModifier(doc),
      origin: 'handle',
      createdAt: new Date(),
      createdBy: user._id
    });

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.WORK,
        newData: {
          ...doc
        },
        object: work
      },
      user
    );

    return work;
  },

  async workEdit(
    _root,
    doc: IWork & { _id: string },
    { user, docModifier, models, subdomain }: IContext
  ) {
    const work = await models.Works.getWork(doc._id);

    if (work.origin !== 'handle') {
      throw new Error('not delete');
    }

    const updatedWork = await models.Works.updateWork(doc._id, {
      ...docModifier(doc),
      origin: 'handle',
      updatedAt: new Date(),
      updatedBy: user._id
    });

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.WORK,
        newData: {
          ...doc
        },
        object: work,
        updatedDocument: updatedWork
      },
      user
    );

    return work;
  },

  async workRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const work = await models.Works.getWork(_id);
    if (work.origin !== 'handle') {
      throw new Error('not delete');
    }

    const removed = await models.Works.removeWork(_id);

    await putDeleteLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PERFORM,
        object: work
      },
      user
    );

    return removed;
  }
};

// moduleCheckPermission(workMutations, 'manageWorks');

export default workMutations;
