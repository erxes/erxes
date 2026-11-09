import { useTranslation } from 'react-i18next';

const labels = {
  en: {
    invalidSelection: 'Choose valid products, categories and tags.',
    products: 'Include products',
    tags: 'Include product tags',
    excludeTags: 'Exclude product tags',
    description:
      'Products match any included category, tag or product. All exclusions take precedence, even for explicitly included products. Categories and tags include their children.',
  },
  mn: {
    invalidSelection:
      'Бүтээгдэхүүн, ангилал болон тагийн сонголтоо шалгана уу.',
    products: 'Оруулах бүтээгдэхүүнүүд',
    tags: 'Оруулах бүтээгдэхүүний тагууд',
    excludeTags: 'Хасах бүтээгдэхүүний тагууд',
    description:
      'Оруулах ангилал, таг эсвэл бүтээгдэхүүний аль нэгэнд таарсныг оруулна. Шууд сонгосон бүтээгдэхүүн ч хасах нөхцөлд таарвал хасагдана. Ангилал, тагийн дэд бүтцийг хамруулна.',
  },
};

export const useProductFilterLabels = (): typeof labels.en => {
  const { i18n } = useTranslation('sales');
  return (i18n.resolvedLanguage || i18n.language).startsWith('mn')
    ? labels.mn
    : labels.en;
};
