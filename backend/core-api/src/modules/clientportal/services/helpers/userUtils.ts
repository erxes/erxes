import { IModels } from '~/connectionResolvers';

export async function updateLastLogin(userId: string, models: IModels): Promise<void> {
  await models.CPUser.updateOne(
    { _id: userId },
    { $set: { lastLoginAt: new Date() } },
  );
}


