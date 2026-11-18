import { useTemplatesGallery } from '@/template/hooks/useTemplatesGallery';
import { TTemplateGroup } from '@/template/types';
import {
  IconAffiliate,
  IconChartPie,
  IconLayoutGrid,
  IconSparkles,
  TablerIcon,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const GROUP_ICONS: Record<TTemplateGroup, TablerIcon> = {
  solution: IconSparkles,
  automation: IconAffiliate,
  segment: IconChartPie,
};

/** The gallery's group choices, each with its icon. */
export const useTemplatesGalleryFilters = () => {
  const { t } = useTranslation('templates');
  const { group, groups, setGroup } = useTemplatesGallery();

  const groupOptions = [
    {
      value: undefined,
      label: t('group-all'),
      icon: IconLayoutGrid,
      isActive: !group,
    },
    ...groups.map((value) => ({
      value,
      label: t(`group-${value}`),
      icon: GROUP_ICONS[value],
      isActive: group === value,
    })),
  ];

  return { groupOptions, selectGroup: setGroup };
};
