// import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import {
  MODULE_NAMES,
  putCreateLog,
  putDeleteLog,
  putUpdateLog
} from '../../../logUtils';
import { sendInventoriesMessage } from '../../../messageBroker';
import { IPerform } from '../../../models/definitions/performs';

const performMutations = {
  /**
   * Creates a new flow
   * @param {Object} doc Product document
   */
  async performAdd(
    _root,
    doc: IPerform,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const perform = await models.Performs.createPerform({
      ...docModifier({ ...doc }),
      type: doc.overallWorkKey.type,
      typeId: doc.overallWorkKey.typeId,
      createdAt: new Date(),
      createdBy: user._id
    });

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PERFORM,
        newData: {
          ...doc
        },
        object: perform
      },
      user
    );

    return perform;
  },

  async performEdit(
    _root,
    doc: IPerform & { _id: string },
    { user, docModifier, models, subdomain }: IContext
  ) {
    // not change branch department and need, result
    // to update count status, inProducts, outProducts

    const perform = await models.Performs.getPerform(doc._id);

    if (perform.status === 'confirmed') {
      throw new Error('Cannot be edited because it is confirmed');
    }

    const updatedPerform = await models.Performs.updatePerform(
      doc._id,
      {
        ...docModifier(doc),
        type: doc.overallWorkKey.type,
        typeId: doc.overallWorkKey.typeId,
        modifiedAt: new Date(),
        modifiedBy: user._id
      },
      perform
    );

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PERFORM,
        newData: {
          ...doc
        },
        object: perform,
        updatedDocument: updatedPerform
      },
      user
    );

    return perform;
  },

  async performRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const perform = await models.Performs.getPerform(_id);

    if (perform.status === 'confirmed') {
      throw new Error('Cannot be deleted because it is confirmed');
    }

    const removeResponse = await models.Performs.removePerform(_id);

    await putDeleteLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PERFORM,
        object: perform
      },
      user
    );

    return removeResponse;
  },

  async performConfirm(
    _root,
    { _id, endAt }: { _id: string; endAt: Date },
    { user, models, subdomain }: IContext
  ) {
    const perform = await models.Performs.getPerform(_id);

    if (perform.status === 'confirmed') {
      throw new Error('Already confirmed');
    }

    // processes in or inventories credit
    await sendInventoriesMessage({
      subdomain,
      action: 'remainders.updateMany',
      data: {
        branchId: perform.inBranchId,
        departmentId: perform.inDepartmentId,
        productsData: (perform.inProducts || []).map(ip => ({
          productId: ip.productId,
          uom: ip.uom,
          diffCount: -1 * ip.quantity
        }))
      }
    });

    // processes out or inventories debit
    await sendInventoriesMessage({
      subdomain,
      action: 'remainders.updateMany',
      data: {
        branchId: perform.outBranchId,
        departmentId: perform.outDepartmentId,
        productsData: (perform.outProducts || []).map(op => ({
          productId: op.productId,
          uom: op.uom,
          diffCount: op.quantity
        }))
      }
    });

    const updatedPerform = await models.Performs.updatePerform(
      _id,
      {
        ...perform,
        endAt,
        status: 'confirmed',
        modifiedAt: new Date(),
        modifiedBy: user._id
      },
      perform
    );

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PERFORM,
        newData: {
          ...updatedPerform
        },
        object: perform,
        updatedDocument: updatedPerform
      },
      user
    );

    return updatedPerform;
  },

  async performAbort(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const perform = await models.Performs.getPerform(_id);

    if (perform.status !== 'confirmed') {
      throw new Error('Cannot be abort because not confirmed');
    }

    // processes in or inventories credit
    await sendInventoriesMessage({
      subdomain,
      action: 'remainders.updateMany',
      data: {
        branchId: perform.inBranchId,
        departmentId: perform.inDepartmentId,
        productsData: (perform.inProducts || []).map(data => ({
          productId: data.productId,
          uom: data.uom,
          diffCount: data.quantity
        }))
      }
    });

    // processes out or inventories debit
    await sendInventoriesMessage({
      subdomain,
      action: 'remainders.updateMany',
      data: {
        branchId: perform.outBranchId,
        departmentId: perform.outDepartmentId,
        productsData: (perform.outProducts || []).map(data => ({
          productId: data.productId,
          uom: data.uom,
          diffCount: -1 * data.quantity
        }))
      }
    });

    const updatedPerform = await models.Performs.updatePerform(
      _id,
      {
        ...perform,
        status: 'draft',
        modifiedAt: new Date(),
        modifiedBy: user._id
      },
      perform
    );

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PERFORM,
        newData: {
          ...updatedPerform
        },
        object: perform,
        updatedDocument: updatedPerform
      },
      user
    );

    return updatedPerform;
  }
};

// moduleCheckPermission(workMutations, 'manageWorks');

export default performMutations;
