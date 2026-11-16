import { useFacebookBots } from '@/integrations/facebook/hooks/useFacebookBots';
import { useCallback, useEffect, useMemo } from 'react';
import {
  TEMPLATE_REQUIREMENT_CARD_LIMIT,
  useTemplateRequirementOptions,
} from 'ui-modules';

/**
 * The page bots to choose from, and the chosen one named as bot and page.
 * Connecting one happens in another tab, so the list reloads when the person
 * comes back; a bot that appears then is the one they made, and is picked.
 */
export const useFacebookTemplateRequirement = (
  value: unknown,
  onChange: (value: unknown) => void,
  onLabel?: (label: string | null) => void,
) => {
  const { bots, loading, refetch } = useFacebookBots();
  const botId = typeof value === 'string' ? value : '';
  const bot = bots.find(({ _id }) => _id === botId);
  const label = bot
    ? [bot.name, bot.page?.name].filter(Boolean).join(' · ')
    : null;

  const select = useCallback(
    (next?: string) => onChange(next || null),
    [onChange],
  );
  const options = useMemo(
    () =>
      bots.map((item) => ({
        value: item._id,
        label: item.name || '',
        description: item.page?.name || undefined,
        imageUrl: item.profileUrl || undefined,
      })),
    [bots],
  );

  useTemplateRequirementOptions({
    ids: options.map((option) => option.value),
    value: botId,
    loading,
    onSelect: select,
  });

  useEffect(() => {
    const reload = () => {
      refetch().catch(() => undefined);
    };

    window.addEventListener('focus', reload);
    return () => window.removeEventListener('focus', reload);
  }, [refetch]);

  useEffect(() => {
    if (!loading) {
      onLabel?.(label);
    }
  }, [loading, label, onLabel]);

  return {
    botId,
    options,
    loading,
    showCards: options.length <= TEMPLATE_REQUIREMENT_CARD_LIMIT,
    select,
  };
};
