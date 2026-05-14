import { IModels } from '~/connectionResolvers';

export const createChecklist = async (models: IModels, execution, action) => {
  const { actions = [] } = execution;

  const prevAction = actions[actions.length - 1];

  const object: any = {
    contentType: 'deal',
  };

  if (
    prevAction?.actionType === 'sales:deal.create' &&
    prevAction?.nextActionId === action.id &&
    prevAction?.result?.itemId
  ) {
    object.contentTypeId = prevAction.result.itemId;
  } else {
    if (!execution?.triggerType?.includes('sales:deal')) {
      throw new Error('Unsupported trigger type');
    }

    object.contentTypeId = execution?.targetId;
  }

  const { items, name } = action?.config || {};

  const checklist = await models.Checklists.create({
    ...object,
    title: name,
    createdDate: new Date(),
  });

  await models.ChecklistItems.insertMany(
    items.map(({ label }, i) => ({
      createdDate: new Date(),
      checklistId: checklist._id,
      content: label,
      order: i,
    })),
  );

  if (items.some((item) => !!item?.isChecked)) {
    return { result: checklist.toObject(), objToWait: {} };
  }

  return { result: checklist.toObject() };
};
