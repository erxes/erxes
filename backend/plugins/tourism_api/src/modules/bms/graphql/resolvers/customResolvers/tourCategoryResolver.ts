import { ITourCategoryDocument } from '@/bms/@types/tour';
const tourCategory = {
  attachment(category: ITourCategoryDocument) {
    return category.attachment || null;
  },
};

export default tourCategory;
