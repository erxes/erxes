import { IContext } from "../../../connectionResolver";
import { IChecklistDocument } from "../../../models/definitions/checklists";

export default {
  items(checklist: IChecklistDocument, _args, { models }: IContext) {
    return models.ChecklistItems.find({ checklistId: checklist._id }).sort({
      order: 1
    });
  },

  async percent(checklist: IChecklistDocument, _args, { models }: IContext) {
    const items = await models.ChecklistItems.find({ checklistId: checklist._id });

    if (items.length === 0) {
      return 0;
    }

    const checkedItems = items.filter(item => {
      return item.isChecked;
    });

    return (checkedItems.length / items.length) * 100;
  }
};