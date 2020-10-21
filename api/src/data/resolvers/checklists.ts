import { ChecklistItems } from '../../db/models';
import { IChecklistDocument } from '../../db/models/definitions/checklists';

export default {
  items(checklist: IChecklistDocument) {
    return ChecklistItems.find({ checklistId: checklist._id }).sort({ order: 1 });
  },

  async percent(checklist: IChecklistDocument) {
    const items = await ChecklistItems.find({ checklistId: checklist._id });

    if (items.length === 0) {
      return 0;
    }

    const checkedItems = items.filter(item => {
      return item.isChecked;
    });

    return (checkedItems.length / items.length) * 100;
  },
};
