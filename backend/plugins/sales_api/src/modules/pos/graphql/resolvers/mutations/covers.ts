import { IContext } from '~/connectionResolvers';
import { sendPosclientMessage } from '~/initWorker';

export const coverMutations = {
  async posCoversEdit(
    _root,
    doc: { _id: string; note: string },
    { models, __, checkPermission }: IContext,
  ) {
    await checkPermission('posCoversEdit');
    const cover = await models.Covers.getCover(doc._id);

    return await models.Covers.updateCover(
      doc._id,
      __({
        ...cover,
        note: doc.note,
      }),
    );
  },

  async posCoversRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('posCoversRemove');
    const cover = await models.Covers.getCover(_id);
    const toPos = await models.Pos.getPos({ token: cover.posToken });

    const posclientCover: unknown = await sendPosclientMessage({
      subdomain,
      action: 'covers.remove',
      method: 'query',
      input: { cover },
      pos: toPos,
      throwOnError: true,
    });

    if (
      !posclientCover ||
      typeof posclientCover !== 'object' ||
      !('_id' in posclientCover) ||
      posclientCover._id !== _id ||
      !('status' in posclientCover) ||
      posclientCover.status !== 'reconf'
    ) {
      throw new Error('Could not unpublish cover in POS client');
    }

    return await models.Covers.deleteCover(_id);
  },
};
