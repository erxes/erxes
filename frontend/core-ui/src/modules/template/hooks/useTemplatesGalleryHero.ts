import {
  TEMPLATE_BOT_EMPTY_POSE,
  TEMPLATE_BOT_SEARCH_POSE,
  TEMPLATE_BOT_WAVE_POSE,
} from '@/template/constants/templateBotPoses';
import { useTemplatesGallery } from '@/template/hooks/useTemplatesGallery';
import {
  IconApps,
  IconCoin,
  IconHeadset,
  IconPackage,
  IconTrophy,
  TablerIcon,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';

const SEARCH_DEBOUNCE_MS = 250;

// Icons for the apps that ship templates today; any other app gets a generic one
const APP_ICONS: Record<string, TablerIcon> = {
  sales: IconTrophy,
  frontline: IconHeadset,
  loyalty: IconCoin,
  core: IconPackage,
};

const appLabelOf = (pluginName: string) =>
  pluginName.charAt(0).toUpperCase() + pluginName.slice(1);

/**
 * The gallery's banner: a search that narrows as you type, the apps to pick
 * from, and the erxes bot reacting to it — waving, searching, or shrugging
 * when nothing matches.
 */
export const useTemplatesGalleryHero = () => {
  const { t } = useTranslation('templates');
  const {
    search,
    setSearch,
    plugin,
    plugins,
    setPlugin,
    templates,
    totalCount,
  } = useTemplatesGallery();
  const [input, setInput] = useState(search);
  const [debouncedInput] = useDebounce(input, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedInput !== search) {
      setSearch(debouncedInput);
    }
    // Only typing writes the search; the URL changing elsewhere does not loop
  }, [debouncedInput]);

  const isSearching = !!input.trim();
  const isEmpty = isSearching && !!search && !templates.length;

  const botPoseOf = () => {
    if (isEmpty) {
      return TEMPLATE_BOT_EMPTY_POSE;
    }

    return isSearching ? TEMPLATE_BOT_SEARCH_POSE : TEMPLATE_BOT_WAVE_POSE;
  };

  return {
    input,
    setInput,
    clearInput: () => setInput(''),
    subtitle: t('hero-subtitle', {
      count: totalCount,
      apps: plugins.map(appLabelOf).join(', '),
    }),
    botPose: botPoseOf(),
    apps: plugins.map((name) => ({
      name,
      label: appLabelOf(name),
      icon: APP_ICONS[name] || IconApps,
      isActive: plugin === name,
    })),
    toggleApp: (name: string) => setPlugin(plugin === name ? undefined : name),
  };
};
