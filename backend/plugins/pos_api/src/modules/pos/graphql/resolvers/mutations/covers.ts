import { IContext } from "~/connectionResolvers";

const coverMutations = {
  async posCoversEdit(
    _root,
    doc: { _id: string; note: string },
    { models, __ }: IContext,
  ) {
    const cover = await models.Covers.getCover(doc._id);

    return await models.Covers.updateCover(doc._id, __({
      ...cover,
      note: doc.note,
    }));
  },

  async posCoversRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext,
  ) {
    const cover = await models.Covers.getCover(_id);
    const toPos = await models.Pos.getPos({ token: cover.posToken });

    // const posclientCover = await sendPosclientMessage({
    //   subdomain,
    //   action: 'covers.remove',
    //   data: {
    //     cover,
    //   },
    //   pos: toPos,
    //   isRPC: true,
    // });

    // if (posclientCover.status !== 'reconf') {
    //   throw new Error('error of posclient');
    // }

    return await models.Covers.deleteCover(_id);
  },
};

// checkPermission(coverMutations, 'posCoversEdit', 'ManageCovers');
// checkPermission(coverMutations, 'posCoversRemove', 'ManageCovers');
export default coverMutations;