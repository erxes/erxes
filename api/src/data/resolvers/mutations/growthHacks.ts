import { GrowthHacks } from '../../../db/models';
import { IItemDragCommonFields } from '../../../db/models/definitions/boards';
import { IGrowthHack } from '../../../db/models/definitions/growthHacks';
import { IUserDocument } from '../../../db/models/definitions/users';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { itemsAdd, itemsArchive, itemsChange, itemsCopy, itemsEdit, itemsRemove } from './boardUtils';

interface IGrowthHacksEdit extends IGrowthHack {
  _id: string;
}

const growthHackMutations = {
  /**
   * Create new growth hack
   */
  async growthHacksAdd(
    _root,
    doc: IGrowthHack & { proccessId: string; aboveItemId: string },
    { user, docModifier }: IContext,
  ) {
    return itemsAdd(doc, 'growthHack', user, docModifier, GrowthHacks.createGrowthHack);
  },

  /**
   * Edit a growth hack
   */
  async growthHacksEdit(_root, { _id, proccessId, ...doc }: IGrowthHacksEdit & { proccessId: string }, { user }) {
    const oldGrowthHack = await GrowthHacks.getGrowthHack(_id);

    return itemsEdit(_id, 'growthHack', oldGrowthHack, doc, proccessId, user, GrowthHacks.updateGrowthHack);
  },

  /**
   * Change a growth hack
   */
  async growthHacksChange(_root, doc: IItemDragCommonFields, { user }: IContext) {
    return itemsChange(doc, 'growthHack', user, GrowthHacks.updateGrowthHack);
  },

  /**
   * Remove a growth hack
   */
  async growthHacksRemove(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    return itemsRemove(_id, 'growthHack', user);
  },

  /**
   * Watch a growth hack
   */
  growthHacksWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: { user: IUserDocument }) {
    return GrowthHacks.watchGrowthHack(_id, isAdd, user._id);
  },

  /**
   * Vote a growth hack
   */
  growthHacksVote(_root, { _id, isVote }: { _id: string; isVote: boolean }, { user }: { user: IUserDocument }) {
    return GrowthHacks.voteGrowthHack(_id, isVote, user._id);
  },

  async growthHacksCopy(_root, { _id, proccessId }: { _id: string; proccessId: string }, { user }: IContext) {
    const extraDocs = ['votedUserIds', 'voteCount', 'hackStages', 'reach', 'impact', 'confidence', 'ease'];

    return itemsCopy(_id, proccessId, 'growthHack', user, extraDocs, GrowthHacks.createGrowthHack);
  },

  async growthHacksArchive(
    _root,
    { stageId, proccessId }: { stageId: string; proccessId: string },
    { user }: IContext,
  ) {
    return itemsArchive(stageId, 'growthHack', proccessId, user);
  },
};

checkPermission(growthHackMutations, 'growthHacksAdd', 'growthHacksAdd');
checkPermission(growthHackMutations, 'growthHacksEdit', 'growthHacksEdit');
checkPermission(growthHackMutations, 'growthHacksRemove', 'growthHacksRemove');
checkPermission(growthHackMutations, 'growthHacksWatch', 'growthHacksWatch');
checkPermission(growthHackMutations, 'growthHacksArchive', 'growthHacksArchive');

export default growthHackMutations;
