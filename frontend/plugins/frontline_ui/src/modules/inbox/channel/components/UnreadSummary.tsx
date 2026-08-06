import { useTranslation } from 'react-i18next';

/**
 * The "N unread" figure a navigation group shows beside its name. The `visible`
 * class is deliberate: `NavigationMenuGroup` keeps its actions slot hidden
 * until hover and `visibility` inherits, so a permanent summary opts back in.
 */
export const UnreadSummary = ({ count }: { count: number }) => {
  const { t } = useTranslation('frontline');

  if (count <= 0) {
    return null;
  }

  return (
    <span className="visible text-xs font-medium normal-case text-muted-foreground tabular-nums">
      {t('unread-count', { count })}
    </span>
  );
};
