import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

import { ITag } from '../../../models/definitions/tags';
import { fixRelatedItems, tagObject } from '../../../utils';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  putActivityLog
} from '../../../logUtils';

import { sendCommonMessage } from '../../../messageBroker';
import { serviceDiscovery } from '../../../configs';

interface ITagsEdit extends ITag {
  _id: string;
}

const TAG = 'tag';

const tagMutations = {
  /**
   * Creates a new tag
   */
  async tagsAdd(
    _root,
    doc: ITag,
    { docModifier, models, subdomain, user }: IContext
  ) {
    const tag = await models.Tags.createTag(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      { type: TAG, newData: tag, object: tag },
      user
    );

    return tag;
  },

  /**
   * Edits a tag
   */
  async tagsEdit(
    _root,
    { _id, ...doc }: ITagsEdit,
    { models, subdomain, user }: IContext
  ) {
    const tag = await models.Tags.getTag(_id);
    const updated = await models.Tags.updateTag(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      { type: TAG, object: tag, newData: doc },
      user
    );

    return updated;
  },

  /**
   * Removes a tag
   */
  async tagsRemove(
    _root,
    { _id }: { _id: string },
    { models, user, subdomain }: IContext
  ) {
    const tag = await models.Tags.getTag(_id);
    const removed = await models.Tags.removeTag(_id);

    await fixRelatedItems({
      subdomain,
      type: tag.type,
      sourceId: tag._id,
      action: 'remove'
    });

    await putDeleteLog(models, subdomain, { type: TAG, object: tag }, user);

    return removed;
  },

  /**
   * Attach a tag
   */
  async tagsTag(
    _root,
    {
      type,
      targetIds,
      tagIds
    }: { type: string; targetIds: string[]; tagIds: string[] },
    { models, subdomain, user }: IContext
  ) {
    const services = await serviceDiscovery.getServices();

    for (const serviceName of services) {
      if (serviceName !== (type || '').split(':')[0]) {
        continue;
      }

      const service = await serviceDiscovery.getService(serviceName, true);
      const meta = service.config?.meta || {};

      if (meta && meta.tags && meta.tags.publishChangeAvailable) {
        await sendCommonMessage({
          subdomain,
          serviceName,
          action: 'publishChange',
          data: {
            targetIds,
            type: 'tag'
          }
        });
      }
    }

    const prevTagsCount = await models.Tags.find({
      _id: { $in: tagIds },
      type
    }).countDocuments();

    if (prevTagsCount !== tagIds.length) {
      throw new Error('Tag not found.');
    }

    const targets = await tagObject(subdomain, type, tagIds, targetIds);

    for (const target of targets) {
      await putActivityLog(subdomain, {
        action: 'createTagLog',
        data: {
          contentId: target._id,
          userId: user ? user._id : '',
          contentType: type,
          target,
          content: { tagIds: tagIds || [] },
          createdBy: user._id,
          action: 'tagged'
        }
      });
    }
  },

  async tagsMerge(
    _root,
    { sourceId, destId }: { sourceId: string; destId: string },
    { models, subdomain }: IContext
  ) {
    const source = await models.Tags.getTag(sourceId);

    await fixRelatedItems({
      subdomain,
      type: source.type,
      sourceId,
      destId,
      action: 'merge'
    });

    // remove old tag
    await models.Tags.removeTag(sourceId);

    return models.Tags.getTag(destId);
  }
};

requireLogin(tagMutations, 'tagsTag');

checkPermission(tagMutations, 'tagsAdd', 'manageTags');
checkPermission(tagMutations, 'tagsEdit', 'manageTags');
checkPermission(tagMutations, 'tagsRemove', 'manageTags');
checkPermission(tagMutations, 'tagsMerge', 'manageTags');

export default tagMutations;
