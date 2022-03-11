import { IItemDragCommonFields } from '../../../models/definitions/boards';
import { IGrowthHack } from '../../../models/definitions/growthHacks';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  itemsAdd,
  itemsArchive,
  itemsChange,
  itemsCopy,
  itemsEdit,
  itemsRemove
} from './utils';
import { IContext } from '../../../connectionResolver';

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
    { user, docModifier, models }: IContext
  ) {
    return itemsAdd(
      models,
      doc,
      'growthHack',
      models.GrowthHacks.createGrowthHack,
      user,
      docModifier
    );
  },

  /**
   * Edit a growth hack
   */
  async growthHacksEdit(
    _root,
    { _id, proccessId, ...doc }: IGrowthHacksEdit & { proccessId: string },
    { user, models }
  ) {
    const oldGrowthHack = await models.GrowthHacks.getGrowthHack(_id);

    return itemsEdit(
      models,
      _id,
      'growthHack',
      oldGrowthHack,
      doc,
      proccessId,
      user,
      models.GrowthHacks.updateGrowthHack
    );
  },

  /**
   * Change a growth hack
   */
  async growthHacksChange(
    _root,
    doc: IItemDragCommonFields,
    { user, models }: IContext
  ) {
    return itemsChange(models, doc, 'growthHack', user, models.GrowthHacks.updateGrowthHack);
  },

  /**
   * Remove a growth hack
   */
  async growthHacksRemove(_root, { _id }: { _id: string }, { user, models }: IContext) {
    return itemsRemove(models, _id, 'growthHack', user);
  },

  /**
   * Watch a growth hack
   */
  growthHacksWatch(
    _root,
    { _id, isAdd }: { _id: string; isAdd: boolean },
    { user, models }: IContext
  ) {
    return models.GrowthHacks.watchGrowthHack(_id, isAdd, user._id);
  },

  /**
   * Vote a growth hack
   */
  growthHacksVote(
    _root,
    { _id, isVote }: { _id: string; isVote: boolean },
    { user, models }: IContext
  ) {
    return models.GrowthHacks.voteGrowthHack(_id, isVote, user._id);
  },

  async growthHacksCopy(
    _root,
    { _id, proccessId }: { _id: string; proccessId: string },
    { user, models }: IContext
  ) {
    const extraDocs = [
      'votedUserIds',
      'voteCount',
      'hackStages',
      'reach',
      'impact',
      'confidence',
      'ease'
    ];

    return itemsCopy(
      models,
      _id,
      proccessId,
      'growthHack',
      user,
      extraDocs,
      models.GrowthHacks.createGrowthHack
    );
  },

  async growthHacksArchive(
    _root,
    { stageId, proccessId }: { stageId: string; proccessId: string },
    { user, models }: IContext
  ) {
    return itemsArchive(models, stageId, 'growthHack', proccessId, user);
  }
};

checkPermission(growthHackMutations, 'growthHacksAdd', 'growthHacksAdd');
checkPermission(growthHackMutations, 'growthHacksEdit', 'growthHacksEdit');
checkPermission(growthHackMutations, 'growthHacksRemove', 'growthHacksRemove');
checkPermission(growthHackMutations, 'growthHacksWatch', 'growthHacksWatch');
checkPermission(
  growthHackMutations,
  'growthHacksArchive',
  'growthHacksArchive'
);

export default growthHackMutations;
