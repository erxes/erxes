import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import {
  MODULE_NAMES,
  putCreateLog,
  putDeleteLog,
  putUpdateLog
} from '../../../logUtils';
import { sendInventoriesMessage } from '../../../messageBroker';
import { IPerform } from '../../../models/definitions/performs';

const sendInv = async (
  subdomain: string,
  productsData: any[],
  branchId?: string,
  departmentId?: string,
  multiplierCount = 0,
  multiplierSoonIn = 0,
  multiplierSoonOut = 0
) => {
  if (!branchId || !departmentId || !productsData.length) {
    return;
  }

  await sendInventoriesMessage({
    subdomain,
    action: 'remainders.updateMany',
    data: {
      branchId,
      departmentId,
      productsData: (productsData || []).map(ip => ({
        productId: ip.productId,
        uom: ip.uom,
        diffCount: multiplierCount * ip.quantity,
        diffSoonIn: multiplierSoonIn * ip.quantity,
        diffSoonOut: multiplierSoonOut * ip.quantity
      }))
    }
  });
};

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

    await sendInv(
      subdomain,
      doc.inProducts,
      doc.inBranchId,
      doc.inDepartmentId,
      0,
      0,
      1
    );
    await sendInv(
      subdomain,
      doc.outProducts,
      doc.outBranchId,
      doc.outDepartmentId,
      0,
      1,
      0
    );

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

    await sendInv(
      subdomain,
      perform.inProducts,
      perform.inBranchId,
      perform.inDepartmentId,
      0,
      0,
      -1
    );
    await sendInv(
      subdomain,
      doc.inProducts,
      doc.inBranchId,
      doc.inDepartmentId,
      0,
      0,
      1
    );
    await sendInv(
      subdomain,
      perform.outProducts,
      perform.outBranchId,
      perform.outDepartmentId,
      0,
      -1,
      0
    );
    await sendInv(
      subdomain,
      doc.outProducts,
      doc.outBranchId,
      doc.outDepartmentId,
      0,
      1,
      0
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

    await sendInv(
      subdomain,
      perform.inProducts,
      perform.inBranchId,
      perform.inDepartmentId,
      0,
      0,
      -1
    );
    await sendInv(
      subdomain,
      perform.outProducts,
      perform.outBranchId,
      perform.outDepartmentId,
      0,
      -1,
      0
    );

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

    await sendInv(
      subdomain,
      perform.inProducts,
      perform.inBranchId,
      perform.inDepartmentId,
      -1,
      0,
      -1
    );
    await sendInv(
      subdomain,
      perform.outProducts,
      perform.outBranchId,
      perform.outDepartmentId,
      1,
      -1,
      0
    );

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

    await sendInv(
      subdomain,
      perform.inProducts,
      perform.inBranchId,
      perform.inDepartmentId,
      1,
      0,
      1
    );
    await sendInv(
      subdomain,
      perform.outProducts,
      perform.outBranchId,
      perform.outDepartmentId,
      -1,
      1,
      0
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

moduleCheckPermission(performMutations, 'manageWorks');

export default performMutations;
