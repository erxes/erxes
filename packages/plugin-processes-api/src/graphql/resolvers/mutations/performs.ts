// import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putUpdateLog,
  putDeleteLog,
  MODULE_NAMES
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import {
  IPerform,
  IPerformDocument
} from '../../../models/definitions/performs';
import { sendInventoriesMessage } from '../../../messageBroker';

const editQuantity = async (
  subdomain: string,
  oldPerform: IPerformDocument,
  newPerform: IPerformDocument,
  kind: 'in' | 'out'
) => {
  const keyProducts = `${kind}Products`;
  const keyBranchId = `${kind}BranchId`;
  const keyDepartmentId = `${kind}DepartmentId`;
  const multiplier = kind === 'in' ? 1 : -1;

  if (!(oldPerform[keyProducts].length && newPerform[keyProducts].length)) {
    return;
  }

  if (
    oldPerform[keyBranchId] === newPerform[keyBranchId] &&
    oldPerform[keyDepartmentId] === newPerform[keyDepartmentId]
  ) {
    const keyProductsByProductId = {};
    for (const data of oldPerform[keyProducts]) {
      keyProductsByProductId[data.productId] = {
        uom: data.uom,
        diffCount: data.quantity
      };
    }

    for (const updatedData of newPerform[keyProducts]) {
      const oldData = keyProductsByProductId[updatedData.productId];
      if (oldData) {
        oldData.diffCount =
          multiplier * (oldData.diffCount - updatedData.quantity);
      } else {
        keyProductsByProductId[updatedData.productId] = {
          uom: updatedData.uom,
          diffCount: -1 * multiplier * updatedData.quantity
        };
      }
    }

    const keyProductsData: any[] = [];
    for (const productId of Object.keys(keyProductsByProductId)) {
      if (keyProductsByProductId[productId].diffCount !== 0) {
        keyProductsData.push({
          productId,
          ...keyProductsByProductId[productId]
        });
      }
    }

    if (keyProductsData.length) {
      // processes in or inventories credit and out or inventories debit
      await sendInventoriesMessage({
        subdomain,
        action: 'remainders.updateMany',
        data: {
          branchId: newPerform[keyBranchId],
          departmentId: newPerform[keyDepartmentId],
          productsData: keyProductsData
        }
      });
    }

    return;
  }

  await sendInventoriesMessage({
    subdomain,
    action: 'remainders.updateMany',
    data: {
      branchId: oldPerform[keyBranchId],
      departmentId: oldPerform[keyDepartmentId],
      productsData: (oldPerform[keyProducts] || []).map(ip => ({
        productId: ip.productId,
        uom: ip.uom,
        diffCount: 1 * multiplier * ip.quantity
      }))
    }
  });

  await sendInventoriesMessage({
    subdomain,
    action: 'remainders.updateMany',
    data: {
      branchId: newPerform[keyBranchId],
      departmentId: newPerform[keyDepartmentId],
      productsData: (newPerform[keyProducts] || []).map(ip => ({
        productId: ip.productId,
        uom: ip.uom,
        diffCount: -1 * multiplier * ip.quantity
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

    // await editQuantity(subdomain, perform, updatedPerform, 'in');
    // await editQuantity(subdomain, perform, updatedPerform, 'out');

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

    // await editQuantity(subdomain, perform, updatedPerform, 'in');
    // await editQuantity(subdomain, perform, updatedPerform, 'out');

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
