import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';

import { IUom, IUomDocument } from '../../../models/definitions/uoms';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';

interface IUomsEdit extends IUom {
  _id: string;
}

const uomMutations = {
  /**
   * Creates a new uom
   * @param {Object} doc uom document
   */
  async uomsAdd(
    _root,
    doc: IUom,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const uom = await models.Uoms.createUom(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.UOM,
        newData: {
          ...doc
        },
        object: uom
      },
      user
    );

    return uom;
  },

  /**
   * Edits a uom
   * @param {string} param2._id uom id
   * @param {Object} param2.doc uom info
   */
  async uomsEdit(
    _root,
    { _id, ...doc }: IUomsEdit,
    { user, models, subdomain }: IContext
  ) {
    const uom = await models.Uoms.getUom({ _id });
    const updated = await models.Uoms.updateUom(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.UOM,
        object: uom,
        newData: { ...doc },
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Removes a uom
   * @param {string} param1._id Uom id
   */
  async uomsRemove(
    _root,
    { uomIds }: { uomIds: string[] },
    { user, models, subdomain }: IContext
  ) {
    const uoms: IUomDocument[] = await models.Uoms.find({
      _id: { $in: uomIds }
    }).lean();

    const response = await models.Uoms.removeUoms(uomIds);

    for (const uom of uoms) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.UOM, object: uom },
        user
      );
    }

    return response;
  }
};

// moduleCheckPermission(uomMutations, 'manageProducts');

export default uomMutations;
