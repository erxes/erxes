import { sendPosMessage } from '../../../messageBroker';
import { ICover } from '../../../models/definitions/covers';
import { IContext } from '../../types';

const coverMutations = {
  async coversAdd(_root, doc: ICover, { posUser, config, models }: IContext) {
    return await models.Covers.createCover({
      ...doc,
      posToken: config.token,
      createdAt: new Date(),
      createdBy: posUser._id
    });
  },

  async coversEdit(
    _root,
    doc: ICover & { _id: string },
    { posUser, config, models }: IContext
  ) {
    const cover = await models.Covers.getCover(doc._id);

    if (cover.status === 'confirm') {
      throw new Error('cannot update (confirmed)');
    }

    if (
      posUser._id !== cover.createdBy &&
      !(config.adminIds || []).includes(posUser._id)
    ) {
      throw new Error('cannot update');
    }

    return await models.Covers.updateCover(doc._id, {
      ...doc,
      posToken: config.token,
      modifiedAt: new Date(),
      modifiedBy: posUser._id
    });
  },

  async coversRemove(
    _root,
    { _id }: { _id: string },
    { posUser, config, models }: IContext
  ) {
    const cover = await models.Covers.getCover(_id);

    if (cover.status === 'confirm') {
      throw new Error('cannot update (confirmed)');
    }

    if (
      posUser._id !== cover.createdBy &&
      !(config.adminIds || []).includes(posUser._id)
    ) {
      throw new Error('cannot remove');
    }

    return await models.Covers.deleteCover(_id);
  },

  async coversConfirm(
    _root,
    { _id }: { _id: string },
    { posUser, config, models, subdomain }: IContext
  ) {
    const cover = await models.Covers.getCover(_id);

    if (cover.status === 'confirm') {
      throw new Error('cannot confirm (confirmed)');
    }

    if (
      posUser._id !== cover.createdBy &&
      !(config.adminIds || []).includes(posUser._id)
    ) {
      throw new Error('cannot confirm');
    }

    const response = await sendPosMessage({
      subdomain,
      action: 'covers.confirm',
      data: { posToken: config.token || '', cover },
      isRPC: true,
      defaultValue: {}
    });

    if (!response._id) {
      throw new Error('unknown error on confirmed');
    }

    await models.Covers.updateCover(_id, {
      ...cover,
      status: 'confirm',
      posToken: config.token,
      modifiedAt: new Date(),
      modifiedBy: posUser._id
    });

    return models.Covers.getCover(_id);
  }
};

export default coverMutations;
