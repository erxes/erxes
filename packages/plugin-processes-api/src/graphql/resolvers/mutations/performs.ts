// import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putUpdateLog,
  putDeleteLog,
  MODULE_NAMES
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { IPerform } from '../../../models/definitions/performs';
import { sendInventoriesMessage } from '../../../messageBroker';

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

    // processes in or inventories credit
    await sendInventoriesMessage({
      subdomain,
      action: 'remainders.updateMany',
      data: {
        branchId: doc.inBranchId,
        departmentId: doc.inDepartmentId,
        productsData: (doc.inProducts || []).map(ip => ({
          productId: ip.productId,
          uomId: ip.uomId,
          diffCount: -1 * ip.quantity
        }))
      }
    });

    // processes out or inventories debit
    await sendInventoriesMessage({
      subdomain,
      action: 'remainders.updateMany',
      data: {
        branchId: doc.outBranchId,
        departmentId: doc.outDepartmentId,
        productsData: (doc.outProducts || []).map(op => ({
          productId: op.productId,
          uomId: op.uomId,
          diffCount: op.quantity
        }))
      }
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
    const updatedPerform = await models.Performs.updatePerform(doc._id, {
      ...docModifier(doc),
      type: doc.overallWorkKey.type,
      typeId: doc.overallWorkKey.typeId,
      modifiedAt: new Date(),
      modifiedBy: user._id
    });

    const inProductsByProductId = {};
    for (const data of perform.inProducts) {
      inProductsByProductId[data.productId] = {
        uomId: data.uomId,
        diffCount: data.quantity
      };
    }

    for (const updatedData of updatedPerform.inProducts) {
      const oldData = inProductsByProductId[updatedData.productId];
      if (oldData) {
        oldData.diffCount = oldData.diffCount - updatedData.quantity;
      } else {
        inProductsByProductId[updatedData.productId] = {
          uomId: updatedData.uomId,
          diffCount: -1 * updatedData.quantity
        };
      }
    }

    const inProductsData: any[] = [];
    for (const productId of Object.keys(inProductsByProductId)) {
      inProductsData.push({
        productId,
        ...inProductsByProductId[productId]
      });
    }

    // processes in or inventories credit
    await sendInventoriesMessage({
      subdomain,
      action: 'remainders.updateMany',
      data: {
        branchId: doc.inBranchId,
        departmentId: doc.inDepartmentId,
        productsData: inProductsData
      }
    });

    const outProductsByProductId = {};
    for (const data of perform.outProducts) {
      outProductsByProductId[data.productId] = {
        uomId: data.uomId,
        diffCount: -1 * data.quantity
      };
    }

    for (const updatedData of updatedPerform.outProducts) {
      const oldData = outProductsByProductId[updatedData.productId];
      if (oldData) {
        oldData.diffCount = oldData.diffCount + updatedData.quantity;
      } else {
        outProductsByProductId[updatedData.productId] = {
          uomId: updatedData.uomId,
          diffCount: updatedData.quantity
        };
      }
    }

    const outProductsData: any[] = [];
    for (const productId of Object.keys(outProductsByProductId)) {
      outProductsData.push({
        productId,
        ...outProductsByProductId[productId]
      });
    }

    // processes out or inventories debit
    await sendInventoriesMessage({
      subdomain,
      action: 'remainders.updateMany',
      data: {
        branchId: doc.outBranchId,
        departmentId: doc.outDepartmentId,
        productsData: outProductsData
      }
    });

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
    const removeResponse = await models.Performs.removePerform(_id);

    // processes in or inventories credit
    await sendInventoriesMessage({
      subdomain,
      action: 'remainders.updateMany',
      data: {
        branchId: perform.inBranchId,
        departmentId: perform.inDepartmentId,
        productsData: (perform.inProducts || []).map(data => ({
          productId: data.productId,
          uomId: data.uomId,
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
          uomId: data.uomId,
          diffCount: -1 * data.quantity
        }))
      }
    });

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
  }
};

// moduleCheckPermission(workMutations, 'manageWorks');

export default performMutations;
