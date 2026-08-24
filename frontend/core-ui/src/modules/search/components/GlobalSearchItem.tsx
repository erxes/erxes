import { IconCornerDownLeft } from '@tabler/icons-react';
import { Command, highlightMatch, TSearchResultItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const includesSearchValue = (
  value: string | undefined,
  searchValue: string,
) => {
  const term = searchValue.trim().toLocaleLowerCase();
  const candidate = value?.toLocaleLowerCase();

  if (!candidate || !term) {
    return false;
  }

  if (candidate.includes(term)) {
    return true;
  }

  const compactTerm = term.replace(/[\s\-+()./]/g, '');
  const compactCandidate = candidate.replace(/[\s\-+()./]/g, '');

  return compactTerm.length >= 4 && compactCandidate.includes(compactTerm);
};

export const GlobalSearchItem = ({
  item,
  commandValue,
  icon: Icon,
  searchValue,
  actionLabel,
  onSelect,
}: {
  item: TSearchResultItem;
  commandValue: string;
  icon?: React.ElementType;
  searchValue: string;
  actionLabel: string;
  onSelect: (path: string) => void;
}) => {
  const { t } = useTranslation(['common', 'mongolian']);
  const visibleFieldsMatch =
    includesSearchValue(item.title, searchValue) ||
    includesSearchValue(item.description, searchValue);
  const matchedField = visibleFieldsMatch
    ? undefined
    : item.matchFields?.find(({ value }) =>
        includesSearchValue(value, searchValue),
      );

  return (
    <Command.Item
      className="group h-auto min-h-10 gap-2 rounded-sm px-2 py-1.5"
      value={commandValue}
      onSelect={() => onSelect(item.path)}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border bg-muted/40 text-muted-foreground">
        {Icon && <Icon className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">
          {highlightMatch(item.title, searchValue)}
        </span>
        {matchedField && (
          <span className="block truncate text-xs text-muted-foreground">
            {matchedField.labelKey
              ? t(matchedField.labelKey, {
                  ns: matchedField.labelNamespace,
                  defaultValue: matchedField.label,
                })
              : matchedField.label}
            : {highlightMatch(matchedField.value, searchValue)}
          </span>
        )}
        {!matchedField && item.description && (
          <span className="block truncate text-xs text-muted-foreground">
            {highlightMatch(item.description, searchValue)}
          </span>
        )}
      </span>
      <Command.Shortcut className="flex shrink-0 items-center gap-2 tracking-normal">
        <span className="hidden sm:inline">{actionLabel}</span>
        <IconCornerDownLeft className="hidden size-4 group-data-[selected=true]:block" />
      </Command.Shortcut>
    </Command.Item>
  );
};
