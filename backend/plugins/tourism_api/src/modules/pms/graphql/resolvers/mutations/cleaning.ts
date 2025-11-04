import { IContext } from '~/connectionResolvers';
import { ICleaning } from '~/modules/pms/@types/cleanings';

const cleaningMutations = {
  /**
   * Create or update config object
   */

  async pmsCleaningCreate(_root, doc, { user, models, subdomain }: IContext) {
    return await models.Cleaning.createCleaning(doc);
  },

  async pmsCleaningUpdate(
    _root,
    { _id, doc }: { _id: string; doc: ICleaning },
    { user, models, subdomain }: IContext,
  ) {
    return await models.Cleaning.updateCleaning(_id, doc);
  },

  async pmsCleaningUpdateBulk(
    _root,
    {
      roomIds,
      status,
      who,
    }: { roomIds: string[]; status: string; who: string },
    { user, models, subdomain }: IContext,
  ) {
    for (const roomId of roomIds) {
      const oldCleaning = await models.Cleaning.findOne({ roomId: roomId });
      if (oldCleaning) {
        await models.Cleaning.updateOne(
          { roomId: roomId },
          { $set: { status } },
        );
      } else {
        await models.Cleaning.create({ roomId: roomId, status: status });
      }
      if (oldCleaning?.status !== status) {
        const ret = await models.History.create({
          roomId: roomId,
          statusPrev: oldCleaning?.status || 'None',
          status: status,
          who: who,
          date: new Date(),
        });
      }
    }
    return 'success';
  },
};

export default cleaningMutations;
