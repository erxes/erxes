import { IContext } from '~/connectionResolvers';

const cleaningMutations = {
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
        await models.History.create({
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
