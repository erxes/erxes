import { useTemplatesGallery } from '@/template/hooks/useTemplatesGallery';
import { GROUP_ICONS } from '@/template/hooks/useTemplatesGalleryFilters';
import { useTranslation } from 'react-i18next';

/** The start page's shelves: one per kind of template, with a way to the rest. */
export const useTemplatesGallerySections = () => {
  const { t } = useTranslation('templates');
  const { sections, setGroup } = useTemplatesGallery();

  return sections.map(({ group, templates, total, hasMore }) => ({
    group,
    templates,
    icon: GROUP_ICONS[group],
    title: t(`group-${group}`),
    description: t(`group-${group}-description`),
    seeAllLabel: hasMore ? t('section-see-all', { count: total }) : '',
    seeAll: () => setGroup(group),
  }));
};
