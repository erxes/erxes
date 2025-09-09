import { ITagDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

// set related tags
export const setRelatedTagIds = async (models: IModels, tag: ITagDocument) => {
  if (!tag.parentId) {
    return;
  }

  const parentTag = await models.Tags.findOne({ _id: tag.parentId });

  if (!parentTag) {
    return;
  }

  const relatedIds: string[] = [tag._id, ...(tag.relatedIds || [])];

  await models.Tags.updateOne(
    { _id: parentTag._id },
    {
      $set: {
        relatedIds: [
          ...new Set([...relatedIds, ...(parentTag.relatedIds || [])]),
        ],
      },
    },
  );

  const updated = await models.Tags.findOne({ _id: tag.parentId });

  if (updated) {
    await setRelatedTagIds(models, updated);
  }
};

// remove related tags
export const removeRelatedTagIds = async (
  models: IModels,
  tag: ITagDocument,
) => {
  const tags = await models.Tags.find({ relatedIds: { $in: tag._id } });

  if (tags.length === 0) {
    return;
  }

  const relatedIds: string[] = tag.relatedIds || [];

  relatedIds.push(tag._id);

  const doc: Array<{
    updateOne: {
      filter: { _id: string };
      update: { $set: { relatedIds: string[] } };
    };
  }> = [];

  tags.forEach(async (t) => {
    const ids = (t.relatedIds || []).filter((id) => !relatedIds.includes(id));

    doc.push({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { relatedIds: ids } },
      },
    });
  });

  await models.Tags.bulkWrite(doc);
};

export const countDocuments = async (
  subdomain: string,
  type: string,
  _ids: string[],
) => {
  const [pluginName, moduleName] = type.split(':');

  const MODULE_NAMES = {
    customer: 'customers',
  };

  return await sendTRPCMessage({
    pluginName,
    method: 'mutation',
    module: MODULE_NAMES[moduleName] || moduleName,
    action: 'tag',
    input: {
      type,
      _ids,
      action: 'count',
    },
  });
};
