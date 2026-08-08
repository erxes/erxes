import { Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TGlobalSearchGroup } from '@/search/types/GlobalSearch';
import { GlobalSearchItem } from '@/search/components/GlobalSearchItem';

export const GlobalSearchGroup = ({
  group,
  onSelect,
}: {
  group: TGlobalSearchGroup;
  onSelect: (path: string) => void;
}) => {
  const { t } = useTranslation(group.labelNamespace ?? 'common', {
    keyPrefix: group.labelNamespace ? undefined : 'global-search',
  });
  const { t: tCommon } = useTranslation('common', {
    keyPrefix: 'global-search',
  });

  const label = t(group.labelKey ?? group.key, group.label);

  if (group.status === 'error') {
    return (
      <Command.Group heading={label}>
        <div className="px-2 py-1.5 text-sm text-destructive">
          {tCommon('load-error', "Couldn't load {{label}}", { label })}
        </div>
      </Command.Group>
    );
  }

  if (group.items.length === 0) {
    return null;
  }

  const countLabel =
    group.countMode === 'approximate' && group.items.length >= group.totalCount
      ? `${group.totalCount}+`
      : group.totalCount;

  return (
    <Command.Group
      heading={
        <span className="flex items-center justify-between gap-2">
          {label}
          <span className="tabular-nums">{countLabel}</span>
        </span>
      }
    >
      {group.items.map((item) => (
        <GlobalSearchItem
          key={item.id}
          item={item}
          providerKey={group.key}
          icon={group.icon}
          onSelect={onSelect}
        />
      ))}
    </Command.Group>
  );
};
